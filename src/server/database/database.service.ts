import { Injectable, type OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Octokit } from '@octokit/rest';
import type { AsyncReturnType } from 'type-fest';
import fs from 'fs-extra';
import path from 'path';
import { Database } from '#shared/database';
import type { NamespaceDatabase } from '#shared/namespace-database';
import { type Sha1Value, NamespaceName, type Commit } from '#shared/interfaces/ehtag';
import type { TagRecord } from '#shared/tag-record';
import type { RawTag } from '#shared/raw-tag';
import { Context } from '#shared/markdown/index';
import { InjectableBase } from '../injectable-base.js';
import { OctokitService, type UserInfo } from '../octokit/octokit.service.js';

type User = AsyncReturnType<Octokit['users']['getByUsername']>['data'];

function userEmail(user: User): string {
    return `${Number(user.id)}+${String(user.login)}@users.noreply.github.com`;
}

interface RepoInfo {
    head: Commit;
    blob: Record<string, Sha1Value | undefined>;
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
        this.infoFile = path.join(this.path, '.info');
    }

    private readonly infoFile: string;
    private _info?: RepoInfo;
    private get info(): RepoInfo {
        this._info ??= fs.readJSONSync(this.infoFile) as RepoInfo;
        return this._info;
    }
    private set info(value: RepoInfo) {
        if (this._info?.head.sha !== value.head.sha) {
            this._info = value;
            fs.writeJSONSync(this.infoFile, value);
        }
    }

    async onModuleInit(): Promise<void> {
        await fs.ensureDir(this.path);
        if (!(await fs.pathExists(this.infoFile))) {
            this.info = {
                head: {
                    sha: '' as Sha1Value,
                    message: '',
                    author: {
                        name: 'author',
                        email: 'author@example.com',
                        when: new Date(0),
                    },
                    committer: {
                        name: 'committer',
                        email: 'committer@example.com',
                        when: new Date(0),
                    },
                },
                blob: {},
            };
        }
        await this.pull(true);
        this.data = await Database.create(this.path, {
            head: () => this.info.head,
            repo: () => `https://github.com/${this.repo}.git`,
        });
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
        return this.schedule(async () => {
            const oldInfo = this.info;
            const headCommit = await this.octokit.getHead();
            const blob = { ...oldInfo.blob } as RepoInfo['blob'];
            if (!force && oldInfo.head.sha === headCommit.sha) {
                this.logger.verbose(`Up to date. Sha: ${headCommit.sha}`);
                return undefined;
            }

            const pullFile = async (filename: string, removed = false): Promise<string> => {
                const filePath = path.join(this.path, filename);
                if (removed) {
                    await fs.remove(filePath);
                    blob[filename] = undefined;
                } else {
                    const file = await this.octokit.getFile(filename);
                    if (this.data && file.path.startsWith('database/')) {
                        const ns = /^database\/(.+)\.md$/.exec(file.path)?.[1] as NamespaceName;
                        if (NamespaceName.includes(ns)) {
                            await this.data.data[ns].load(file.content);
                            this.data.revision++;
                        }
                    }
                    await fs.ensureDir(path.dirname(filePath));
                    await fs.writeFile(filePath, file.content);
                    blob[filename] = undefined;
                    filename = file.path;
                    blob[filename] = file.sha;
                }
                return filename;
            };

            let updatedFiles: string[];
            if (force || oldInfo.head.sha.length !== 40) {
                updatedFiles = await Promise.all(
                    ['version', ...NamespaceName.map((ns) => `database/${ns}.md`)].map(async (f) => pullFile(f)),
                );
                this.logger.verbose(`Reconstruction of database. Updated files: ${updatedFiles.join(', ')}`);
            } else {
                const comparison = await this.octokit.compare(this.info.head.sha, headCommit.sha);
                if (comparison.files && comparison.files.length > 0) {
                    updatedFiles = await Promise.all(
                        comparison.files.map(async (f) => pullFile(f.filename, f.status === 'removed')),
                    );
                } else {
                    updatedFiles = [];
                }
                this.logger.verbose(`Update database. Updated files: ${updatedFiles.join(', ')}`);
            }
            this.info = { head: headCommit, blob };
            return updatedFiles;
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
            const message = action(nsDb);
            const content = await nsDb.save();
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
            const blob = { ...this.info.blob };
            const sha = blob[file];
            if (!sha) throw new Error(`Unknown blob sha of ${file}`);
            const result = await this.octokit.updateFile(file, sha, content, msg, {
                name: String(user.login),
                email: userEmail(user),
            });
            blob[file] = result.file.sha;
            this.info = { head: result.commit, blob };
        });
    }
    readonly path: string;
    readonly repo: string;

    data!: Database;
}
