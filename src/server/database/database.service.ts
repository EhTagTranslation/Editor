import { Injectable, NotFoundException, type OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import path from 'node:path';
import { ensureDir, pathExists } from 'fs-extra/esm';
import { simpleGit, type SimpleGit } from 'simple-git';
import { Database } from '#shared/database';
import type { NamespaceDatabase } from '#shared/namespace-database';
import { NamespaceName, type Commit } from '#shared/interfaces/ehtag';
import type { TagRecord } from '#shared/tag-record';
import type { RawTag } from '#shared/raw-tag';
import { Context } from '#shared/markdown/index';
import { GitRepoInfoProvider } from '#shared/repo-info-provider';
import { gitEnvironment } from '#shared/git-environment';
import { InjectableBase } from '../injectable-base.js';
import { OctokitService, type UserInfo } from '../octokit/octokit.service.js';

function userEmail(user: Pick<UserInfo, 'id' | 'login'>): string {
    return `${Number(user.id)}+${String(user.login)}@users.noreply.github.com`;
}

@Injectable()
export class DatabaseService extends InjectableBase implements OnModuleInit {
    constructor(
        private readonly config: ConfigService,
        private readonly octokit: OctokitService,
    ) {
        super();
        this.path = path.resolve(this.config.get('DB_PATH', './db'));
        this.repo = this.config.get('DB_REPO', '/');
    }

    private git!: SimpleGit;
    private head!: Commit;

    async onModuleInit(): Promise<void> {
        await ensureDir(this.path);
        this.git = simpleGit({ baseDir: this.path, allowEnvironment: ['GIT_TERMINAL_PROMPT'] }).env(gitEnvironment());
        // 可直接接管旧版 API 同步留下的非空数据库目录。
        await this.git.init(['--initial-branch=master']);
        const remote = `https://github.com/${this.repo}.git`;
        if ((await this.git.getRemotes()).some((value) => value.name === 'origin')) {
            await this.git.remote(['set-url', 'origin', remote]);
        } else {
            await this.git.addRemote('origin', remote);
        }
        await this.pull(true);
        this.data = await Database.create(this.path, {
            head: () => this.head,
            repo: () => `https://github.com/${this.repo}.git`,
        });
        // 完整历史可能需要较长时间，不能阻塞 HTTP 服务启动。
        void this.schedule(async () => this.ensureHistory()).catch(() => undefined);
    }

    private _repoActing: Promise<unknown> = Promise.resolve();

    /** 排队数据库操作 */
    private async schedule<T>(action: () => Promise<T>): Promise<T> {
        const acting = this._repoActing
            .then(async () => action())
            .catch((err) => {
                this.logger.error(err);
                throw err;
            });
        this._repoActing = acting.catch(() => undefined);
        return acting;
    }

    /** 拉取最新的数据库 */
    async pull(force = false): Promise<string[] | undefined> {
        return this.schedule(async () => this.sync(force));
    }

    private async sync(force = false): Promise<string[] | undefined> {
        const branches = await this.git.branch(['--remotes']);
        const initial = !branches.all.includes('origin/master');
        await this.git.fetch('origin', 'master', ['--no-tags', ...(initial ? ['--depth=1'] : [])]);
        const sha = (await this.git.revparse(['origin/master'])).trim();
        if (!force && this.head?.sha === sha) return undefined;
        const files =
            !force && this.head
                ? (await this.git.diff(['--name-only', this.head.sha, sha])).trim().split('\n').filter(Boolean)
                : ['version', ...NamespaceName.map((ns) => `database/${ns}.md`)];
        await this.git.reset(['--hard', sha]);
        if (this.data) {
            if (files.includes('version')) {
                this.data = await Database.create(this.path, {
                    head: () => this.head,
                    repo: () => `https://github.com/${this.repo}.git`,
                });
            } else {
                await Promise.all(
                    NamespaceName.filter((ns) => files.includes(`database/${ns}.md`)).map(async (ns) => {
                        await this.data.data[ns].load();
                    }),
                );
                this.data.revision++;
            }
        }
        this.head = await new GitRepoInfoProvider(this.path).head();
        this.logger.verbose(`Update database. Sha: ${sha}. Updated files: ${files.join(', ')}`);
        return files;
    }

    private async ensureHistory(): Promise<void> {
        if (!(await pathExists(path.join(this.path, '.git', 'shallow')))) return;
        this.logger.log('Fetching complete database history in the background');
        await this.git.fetch('origin', 'master', ['--no-tags', '--unshallow']);
        this.logger.log('Complete database history is ready');
    }

    /** 查询当前条目的完整行历史，不包含其他条目的修改。 */
    async blame(namespace: NamespaceName, raw: RawTag): Promise<Commit[]> {
        return this.schedule(async () => {
            for (const [key, { line }] of this.data.data[namespace].raw()) {
                if (key !== raw) continue;
                if (line == null) throw new Error('条目尚未保存，无法查询编辑日志');
                // 后台拉取失败后允许重试，不能把浅仓库的截断历史当作完整结果。
                await this.ensureHistory();
                return new GitRepoInfoProvider(this.path).log({
                    [this.head.sha]: null,
                    [`-L${line},${line}:database/${namespace}.md`]: null,
                    '--no-patch': null,
                });
            }
            throw new NotFoundException('条目不存在');
        });
    }

    /** 修改、提交并推送数据库 */
    async apply(
        user: UserInfo,
        ns: NamespaceName,
        action: (db: NamespaceDatabase) => {
            ok?: RawTag;
            ov?: TagRecord;
            nk?: RawTag;
            nv?: TagRecord;
        },
    ): Promise<void> {
        return this.schedule(async () => {
            const nsDb = this.data.data[ns];
            const oldHead = this.head;
            try {
                const message = action(nsDb);
                await nsDb.save();
                let msg: string;
                const oldContext = new Context((message.ov ?? message.nv)!, message.ok);
                const newContext = new Context((message.nv ?? message.ov)!, message.nk);
                if (message.ov && message.nv) {
                    msg = `修改 ${ns}:${message.nk ?? message.ok ?? '(注释)'} - ${message.nv.name.render('text', newContext)}
|        | 原始标签 | 名称 | 描述 | 外部链接 |
| ------ | -------- | ---- | ---- | -------- |
| 修改前 ${message.ov.stringify(oldContext)}
| 修改后 ${message.nv.stringify(newContext)}
            `;
                } else if (message.ov) {
                    msg = `删除 ${ns}:${message.ok ?? '(注释)'} - ${message.ov.name.render('text', oldContext)}
| 原始标签 | 名称 | 描述 | 外部链接 |
| -------- | ---- | ---- | -------- |
${message.ov.stringify(oldContext)}
`;
                } else if (message.nv) {
                    msg = `添加 ${ns}:${message.nk ?? '(注释)'} - ${message.nv.name.render('text', newContext)}
| 原始标签 | 名称 | 描述 | 外部链接 |
| -------- | ---- | ---- | -------- |
${message.nv.stringify(newContext)}
`;
                } else {
                    throw new Error('Invalid message');
                }
                const file = `database/${ns}.md`;
                const bot = await this.octokit.botUserInfo();
                const token = await this.octokit.getAppToken();
                // 凭据只传入子进程环境，不写入 remote URL 或磁盘配置。
                const writer = simpleGit({
                    baseDir: this.path,
                    allowEnvironment: [
                        'GIT_TERMINAL_PROMPT',
                        'GIT_CONFIG_COUNT',
                        'GIT_CONFIG_KEY_0',
                        'GIT_CONFIG_VALUE_0',
                        'GIT_AUTHOR_NAME',
                        'GIT_AUTHOR_EMAIL',
                        'GIT_COMMITTER_NAME',
                        'GIT_COMMITTER_EMAIL',
                    ],
                    // 下方固定一个 extraheader，允许通过环境变量传递该配置。
                    unsafe: { allowUnsafeConfigEnvCount: true },
                }).env({
                    ...gitEnvironment(),
                    GIT_CONFIG_COUNT: '1',
                    GIT_CONFIG_KEY_0: 'http.https://github.com/.extraheader',
                    GIT_CONFIG_VALUE_0: `AUTHORIZATION: basic ${Buffer.from(`x-access-token:${token}`).toString('base64')}`,
                    GIT_AUTHOR_NAME: String(user.login),
                    GIT_AUTHOR_EMAIL: userEmail(user),
                    GIT_COMMITTER_NAME: String(bot.login),
                    GIT_COMMITTER_EMAIL: userEmail(bot),
                });
                await writer.add(file);
                await writer.commit(msg, { '--no-gpg-sign': null });
                const head = await new GitRepoInfoProvider(this.path).head();
                await writer.push('origin', 'HEAD:master');
                this.head = head;
            } catch (error) {
                // 保存或推送失败时恢复本地文件和内存，避免留下未提交的修改。
                await this.git.reset(['--hard', oldHead.sha]);
                await nsDb.load();
                this.data.revision++;
                throw error;
            }
        });
    }
    readonly path: string;
    readonly repo: string;

    data!: Database;
}
