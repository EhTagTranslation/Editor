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
import { Context } from 'shared/interfaces/database';

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
        this.repo = this.config.get('DB_REPO', '');
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
        await fs.mkdirp(path.join(this.path, 'database'));
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

    async pull(): Promise<void> {
        const oldInfo = this.info;
        const headCommit = await this.octokit.getHead();
        const blob = { ...oldInfo.blob } as RepoInfo['blob'];
        if (oldInfo.head.sha === headCommit.sha) return;

        const pullFile = async (filename: string): Promise<void> => {
            const file = await this.octokit.getFile(filename);
            await fs.writeFile(path.join(this.path, file.path), file.content);
            blob[file.path] = file.sha;
        };

        if (oldInfo.head.sha.length !== 40) {
            await Promise.all(['version', ...NamespaceName.map((ns) => `database/${ns}.md`)].map((f) => pullFile(f)));
        } else {
            const comparison = await this.octokit.compare(headCommit.sha, this.info.head.sha);
            await Promise.all(comparison.files.map((f) => pullFile(f.filename)));
        }
        this.info = { head: headCommit, blob };
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
        await this.data.data[ns].save();
        let msg: string;
        const context = Context.create((message.ov ?? message.nv) as TagRecord);
        if (message.ov && message.nv) {
            msg = `修改 ${ns}:${message.nk ?? message.ok ?? '(注释)'} - ${message.nv.name.render('text', context)}
|        | 原始标签 | 名称 | 描述 | 外部链接 |
| ------ | -------- | ---- | ---- | -------- |
| 修改前 ${message.ov.stringify({ ...context, raw: message.ok })}
| 修改后 ${message.nv.stringify({ ...context, raw: message.nk })}
            `;
        } else if (message.ov) {
            msg = `删除 ${ns}:${message.ok ?? '(注释)'} - ${message.ov.name.render('text', context)}
| 原始标签 | 名称 | 描述 | 外部链接 |
| -------- | ---- | ---- | -------- |
${message.ov.stringify({ ...context, raw: message.ok })}
`;
        } else if (message.nv) {
            msg = `添加 ${ns}:${message.nk ?? '(注释)'} - ${message.nv.name.render('text', context)}
| 原始标签 | 名称 | 描述 | 外部链接 |
| -------- | ---- | ---- | -------- |
${message.nv.stringify({ ...context, raw: message.nk })}
`;
        } else {
            throw new Error('Invalid message');
        }
        const file = `database/${ns}.md`;
        const blob = { ...this.info.blob };
        const sha = blob[file];
        if (!sha) throw new Error(`Unknown blob sha of ${file}`);
        const result = await this.octokit.updateFile(file, sha, await fs.readFile(this.data.data[ns].file), msg, {
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
