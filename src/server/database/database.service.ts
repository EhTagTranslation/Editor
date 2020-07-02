import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectableBase } from 'server/injectable-base';
import { ConfigService } from '@nestjs/config';
import { Octokit } from '@octokit/rest';
import { AsyncReturnType } from 'type-fest';
import * as fs from 'fs-extra';
import * as path from 'path';
import { Database } from 'shared/database';
import { OctokitService, UserInfo } from 'server/octokit/octokit.service';
import { Sha1Value, NamespaceName, Commit } from 'shared/interfaces/ehtag';
import { createHash } from 'crypto';

type User = AsyncReturnType<Octokit['users']['getByUsername']>['data'];

function userEmail(user: User): string {
    return `${user.id}+${user.login}@users.noreply.github.com`;
}

@Injectable()
export class DatabaseService extends InjectableBase implements OnModuleInit {
    constructor(private readonly config: ConfigService, private readonly octokit: OctokitService) {
        super();
        this.path = path.resolve(this.config.get('DB_PATH', './db'));
        this.repo = this.config.get('DB_REPO', '');
        this.headFile = path.join(this.path, '.head');
    }

    private get head(): Commit {
        if (!this._head) {
            this._head = fs.readJSONSync(this.headFile) as Commit;
        }
        return this._head;
    }
    private set head(value: Commit) {
        if (this._head?.sha !== value.sha) {
            this._head = value;
            fs.writeJSONSync(this.headFile, value);
        }
    }
    private readonly headFile: string;
    private _head?: Commit;

    async onModuleInit(): Promise<void> {
        await fs.mkdirp(path.join(this.path, 'database'));
        if (!(await fs.pathExists(this.headFile))) {
            this.head = {
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
            };
        }
        await this.pull();
        this.data = await Database.create(this.path, {
            head: () => this.head,
            repo: () => `https://github.com/${this.repo}.git`,
        });
    }

    private async pullFile(filename: string): Promise<void> {
        const file = await this.octokit.getFile(filename);
        await fs.writeFile(path.join(this.path, filename), file.content);
    }
    async pull(): Promise<void> {
        const headCommit = await this.octokit.getHead();
        if (this.head.sha === headCommit.sha) return;
        if (this.head.sha.length !== 40) {
            await Promise.all(
                ['version', ...NamespaceName.map((ns) => `database/${ns}.md`)].map((f) => this.pullFile(f)),
            );
        } else {
            const comparison = await this.octokit.compare(headCommit.sha, this.head.sha);
            await Promise.all(comparison.files.map((f) => this.pullFile(f.filename)));
        }
        this.head = headCommit;
    }

    async commitAndPush(ns: NamespaceName, user: UserInfo, message: string): Promise<void> {
        const checksum = createHash('sha1');
        checksum.update(await fs.readFile(this.data.data[ns].file));
        const oldSha = checksum.digest('hex') as Sha1Value;
        await this.data.data[ns].save();
        const result = await this.octokit.updateFile(
            `database/${ns}.md`,
            oldSha,
            await fs.readFile(this.data.data[ns].file),
            message,
            {
                name: user.login,
                email: userEmail(user),
            },
        );
        this.head = result.commit;
    }
    readonly path: string;
    readonly repo: string;

    public data!: Database;
}
