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

let execId = 0;
type User = AsyncReturnType<Octokit['users']['getByUsername']>['data'];

function userEmail(user: User): string {
    return `${user.id}+${user.login}@users.noreply.github.com`;
}

@Injectable()
export class DatabaseService extends InjectableBase implements OnModuleInit {
    constructor(private readonly config: ConfigService) {
        super();
        this.path = path.resolve(this.config.get('DB_PATH', './db'));
        this.repo = this.config.get('DB_REPO', '');
    }
    async onModuleInit(): Promise<void> {
        const appInfoRes = await this.octokit.apps.getAuthenticated();
        this.appInfo = appInfoRes.data;
        const userInfoRes = await this.octokit.users.getByUsername({ username: `${this.appInfo.slug}[bot]` });
        this.botUserInfo = userInfoRes.data;

        await fs.mkdirp(this.path);
        if (!(await fs.pathExists(path.join(this.path, '.git')))) {
            await this.git('init');
            await this.git(`remote add origin 'https://github.com/${this.repo}.git'`);
        }
        await this.git(`config user.name '${this.botUserInfo.login}'`);
        await this.git(`config user.email '${userEmail(this.botUserInfo)}'`);
        await this.pull();
    }

    private createOctokit(options?: OctokitOptions): Octokit {
        return new Octokit({
            log: {
                // debug: (...args: unknown[]) => this.logger.debug(args),
                info: (arg: unknown) => this.logger.log(arg),
                warn: (arg: unknown) => this.logger.warn(arg),
                error: (arg: unknown) => this.logger.error(arg),
            },
            ...options,
        });
    }

    private async setOrigin(): Promise<void> {
        const tokenRes = await this.octokit.apps.createInstallationAccessToken({
            installation_id: this.config.get('APP_INSTALLATION_ID') as number,
        });
        const token = tokenRes.data.token;
        const origin = `https://${this.botUserInfo.login}:${token}@github.com/${this.repo}.git`;
        await this.git(`remote set-url origin '${origin}'`);
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

    private userInfoCache = new Cache({
        stdTTL: 3600,
        checkperiod: 0,
        useClones: false,
    });
    async commitAndPush(userToken: string, message: string): Promise<void> {
        let user = this.userInfoCache.get<User>(userToken);
        if (!user) {
            user = (await this.createOctokit({ auth: userToken }).users.getAuthenticated()).data;
            this.userInfoCache.set(userToken, user);
        }
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

    appInfo!: AsyncReturnType<Octokit['apps']['getAuthenticated']>['data'];
    botUserInfo!: User;
    readonly path: string;
    readonly repo: string;
    readonly octokit = this.createOctokit({
        authStrategy: createAppAuth,
        auth: {
            id: Number.parseInt(this.config.get('APP_ID', '0')),
            privateKey: this.config.get('APP_KEY', ''),
            installationId: Number.parseInt(this.config.get('APP_INSTALLATION_ID', '0')),
            clientId: this.config.get('APP_CLIENT_ID'),
            clientSecret: this.config.get('APP_CLIENT_SECRET'),
        } as Types['StrategyOptions'],
    });
}
