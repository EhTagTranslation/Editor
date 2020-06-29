import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectableBase } from 'server/injectable-base';
import { ConfigService } from '@nestjs/config';
import { Octokit } from '@octokit/rest';
import { createAppAuth, Types } from '@octokit/auth-app';
import { OctokitOptions } from '@octokit/core/dist-types/types';
import { AsyncReturnType } from 'type-fest';
import * as Cache from 'node-cache';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as execa from 'execa';
import * as shell from 'shell-quote';

import { Database } from 'shared/database';
import { OctokitService, UserInfo } from 'server/octokit/octokit.service';

let execId = 0;
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
    }

    private readonly APP_INSTALLATION_ID: number = Number.parseInt(this.config.get('APP_INSTALLATION_ID', ''));
    async onModuleInit(): Promise<void> {
        await fs.mkdirp(this.path);
        if (!(await fs.pathExists(path.join(this.path, '.git')))) {
            await this.git('init');
            await this.git(`remote add origin 'https://github.com/${this.repo}.git'`);
        }
        await this.git(`config user.name '${this.octokit.botUserInfo.login}'`);
        await this.git(`config user.email '${userEmail(this.octokit.botUserInfo)}'`);
        await this.pull();
        this.data = await Database.create(this.path);
    }

    private createOctokit(options?: OctokitOptions): Octokit {
        return new Octokit({
            log: {
                // debug: (...args: unknown[]) => this.logger.debug(args),
                info: (arg: unknown) => this.logger.log(arg),
                warn: (arg: unknown) => this.logger.warn(arg),
                error: (arg: unknown) => this.logger.error(arg),
            },
            userAgent: 'EhTagTranslation Nest',
            ...options,
        });
    }

    private appToken?: string;
    private async setOrigin(): Promise<void> {
        const token = await this.octokit.getAppToken();
        if (this.appToken !== token) {
            const origin = `https://${this.octokit.botUserInfo.login}:${token}@github.com/${this.repo}.git`;
            await this.git(`remote set-url origin '${origin}'`);
            this.appToken = token;
        }
    }

    private async git(command: string[]): Promise<string>;
    private async git(command: string): Promise<string>;
    private async git(command: string | string[]): Promise<string> {
        const id = ++execId;
        this.logger.log(`Exec[${id}]: git ${typeof command == 'string' ? command : shell.quote(command)}`);
        const commands = typeof command == 'string' ? (shell.parse(command) as string[]) : command;
        commands.unshift('-C', this.path);
        const result = await execa('git', ['-C', this.path, ...commands], { all: true, reject: false });
        if (result.failed) {
            const err = result as execa.ExecaError;
            this.logger.error(`Exec[${id}]: ${err.all ?? ''}`);
            throw err;
        }
        this.logger.log(`Exec[${id}]: finished`);
        return result.all ?? '';
    }

    async pull(): Promise<void> {
        await this.setOrigin();
        await this.git('fetch');
        await this.git('reset --hard origin/master');
    }

    async commitAndPush(user: UserInfo, message: string): Promise<void> {
        const messageFile = path.join(this.path, '.git/COMMIT_MSG');
        await fs.writeFile(messageFile, message);
        await this.git([
            'commit',
            '--allow-empty',
            '--author',
            `${user.login} <${userEmail(user)}>`,
            '-aF',
            messageFile,
        ]);
        await this.setOrigin();
        await this.git('push origin HEAD:master');
    }
    readonly path: string;
    readonly repo: string;

    public data!: Database;
}
