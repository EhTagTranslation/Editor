import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectableBase } from 'server/injectable-base';
import { ConfigService } from '@nestjs/config';
import { Octokit } from '@octokit/rest';
import { AsyncReturnType } from 'type-fest';
import fs from 'fs-extra';
import path from 'path';
import { Database } from 'shared/database';
import { OctokitService, UserInfo } from 'server/octokit/octokit.service';
import { Sha1Value, NamespaceName, Commit } from 'shared/interfaces/ehtag';
import { TagRecord } from 'shared/tag-record';
import { RawTag } from 'shared/validate';
import { Context } from 'shared/markdown';

type User = AsyncReturnType<Octokit['users']['getByUsername']>['data'];

function userEmail(user: User): string {
    return `${user.id}+${user.login}@users.noreply.github.com`;
}

interface RepoInfo {
    head: Commit;
    blob: Record<string, Sha1Value | undefined>;
}

@Injectable()
export class DatabaseService extends InjectableBase implements OnModuleInit {
    constructor(private readonly config: ConfigService, private readonly octokit: OctokitService) {
        super();
        this.path = path.resolve(this.config.get('DB_PATH', './db'));
        this.repo = this.config.get('DB_REPO', '/');
        this.infoFile = path.join(this.path, '.info');
    }

    private get info(): RepoInfo {
        if (!this._info) {
            this._info = fs.readJSONSync(this.infoFile) as RepoInfo;
        }
        return this._info;
    }
    private set info(value: RepoInfo) {
        if (this._info?.head.sha !== value.head.sha) {
            this._info = value;
            fs.writeJSONSync(this.infoFile, value);
        }
    }
    private readonly infoFile: string;
    private _info?: RepoInfo;

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
        await this.pull();
        this.data = await Database.create(this.path, {
            head: () => this.info.head,
            repo: () => `https://github.com/${this.repo}.git`,
        });
    }

    async pull(): Promise<string[] | undefined> {
        const oldInfo = this.info;
        const headCommit = await this.octokit.getHead();
        const blob = { ...oldInfo.blob } as RepoInfo['blob'];
        if (oldInfo.head.sha === headCommit.sha) {
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
        if (oldInfo.head.sha.length !== 40) {
            updatedFiles = await Promise.all(
                ['version', ...NamespaceName.map((ns) => `database/${ns}.md`)].map((f) => pullFile(f)),
            );
            this.logger.verbose(`Reconstruction of database. Updated files: ${updatedFiles.join(', ')}`);
        } else {
            const comparison = await this.octokit.compare(this.info.head.sha, headCommit.sha);
            if (comparison.files && comparison.files.length > 0) {
                updatedFiles = await Promise.all(
                    comparison.files.map((f) => pullFile(f.filename, f.status === 'removed')),
                );
            } else {
                updatedFiles = [];
            }
            this.logger.verbose(`Update database. Updated files: ${updatedFiles.join(', ')}`);
        }
        this.info = { head: headCommit, blob };
        return updatedFiles;
    }

    async commitAndPush(
        ns: NamespaceName,
        user: UserInfo,
        message: {
            ok?: RawTag;
            ov?: TagRecord;
            nk?: RawTag;
            nv?: TagRecord;
        },
    ): Promise<void> {
        const content = await this.data.data[ns].save();
        let msg: string;
        const oldContext = new Context((message.ov ?? message.nv) as TagRecord, message.ok);
        const newContext = new Context((message.nv ?? message.ov) as TagRecord, message.nk);
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
            name: user.login,
            email: userEmail(user),
        });
        blob[file] = result.file.sha;
        this.info = { head: result.commit, blob };
    }
    readonly path: string;
    readonly repo: string;

    public data!: Database;
}
