import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectableBase } from 'server/injectable-base';
import { ConfigService } from '@nestjs/config';
import { Octokit } from '@octokit/rest';
import { AsyncReturnType } from 'type-fest';
import * as fs from 'fs-extra';
import * as path from 'path';
import { Database } from 'shared/database';
import { OctokitService, UserInfo } from 'server/octokit/octokit.service';
import { ExecService } from 'server/exec/exec.service';

type User = AsyncReturnType<Octokit['users']['getByUsername']>['data'];

function userEmail(user: User): string {
    return `${user.id}+${user.login}@users.noreply.github.com`;
}

@Injectable()
export class DatabaseService extends InjectableBase implements OnModuleInit {
    constructor(
        private readonly config: ConfigService,
        private readonly octokit: OctokitService,
        private readonly exec: ExecService,
    ) {
        super();
        this.path = path.resolve(this.config.get('DB_PATH', './db'));
        this.repo = this.config.get('DB_REPO', '');
    }

    private readonly APP_INSTALLATION_ID: number = Number.parseInt(this.config.get('APP_INSTALLATION_ID', ''));
    async onModuleInit(): Promise<void> {
        await fs.mkdirp(this.path);
        if (!(await fs.pathExists(path.join(this.path, '.git')))) {
            await this.exec.git(this.path, 'init');
            await this.exec.git(this.path, `remote add origin 'https://github.com/${this.repo}.git'`);
        }
        await this.exec.git(this.path, `config user.name '${this.octokit.botUserInfo.login}'`);
        await this.exec.git(this.path, `config user.email '${userEmail(this.octokit.botUserInfo)}'`);
        await this.pull();
        this.data = await Database.create(this.path);
    }

    private appToken?: string;
    private async setOrigin(): Promise<void> {
        const token = await this.octokit.getAppToken();
        if (this.appToken !== token) {
            const origin = `https://${this.octokit.botUserInfo.login}:${token}@github.com/${this.repo}.git`;
            await this.exec.git(
                this.path,
                [`remote`, `set-url`, `origin`, origin],
                `remote set-url origin https://${this.octokit.botUserInfo.login}:[REDACTED]@github.com/${this.repo}.git`,
            );
            this.appToken = token;
        }
    }

    async pull(): Promise<void> {
        await this.setOrigin();
        await this.exec.git(this.path, 'fetch');
        await this.exec.git(this.path, 'reset --hard origin/master');
    }

    async commitAndPush(user: UserInfo, message: string): Promise<void> {
        const messageFile = path.join(this.path, '.git/COMMIT_MSG');
        await fs.writeFile(messageFile, message);
        await this.exec.git(this.path, [
            'commit',
            '--allow-empty',
            '--author',
            `${user.login} <${userEmail(user)}>`,
            '-aF',
            messageFile,
        ]);
        await this.setOrigin();
        await this.exec.git(this.path, 'push origin HEAD:master');
    }
    readonly path: string;
    readonly repo: string;

    public data!: Database;
}
