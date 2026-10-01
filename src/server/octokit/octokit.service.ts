import type { AsyncReturnType } from 'type-fest';
import Cache from 'node-cache';
import { Injectable, type OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Octokit } from '@octokit/rest';
import { createAppAuth, type StrategyOptions } from '@octokit/auth-app';
import { createOAuthAppAuth } from '@octokit/auth-oauth-app';
import { InjectableBase } from '../injectable-base.js';

export type AppInfo = NonNullable<Readonly<AsyncReturnType<Octokit['apps']['getAuthenticated']>['data']>>;
export type UserInfo = Readonly<AsyncReturnType<Octokit['users']['getByUsername']>['data']>;

type ApiData<T1 extends keyof Octokit, T2 extends keyof Octokit[T1]> = Octokit[T1][T2] extends () => Promise<{
    data: infer U;
}>
    ? U
    : never;

@Injectable()
export class OctokitService extends InjectableBase implements OnModuleInit {
    constructor(private readonly config: ConfigService) {
        super();
        const db = this.config.get<string>('DB_REPO', '/').trim();
        [this.owner, this.repo] = db.split('/');
    }

    readonly owner: string;
    readonly repo: string;

    onModuleInit(): void {
        this.getAppToken().catch((err: unknown) => this.logger.error(err));
        this._appInfo = this.forApp.apps.getAuthenticated().then((appInfoRes) => {
            if (appInfoRes.data) return Object.freeze(appInfoRes.data);
            else throw new Error(`Failed to get app info`);
        });
        this._botUserInfo = this._appInfo
            .then(async (appInfo) =>
                this.forApp.users.getByUsername({ username: `${appInfo.slug ?? appInfo.name}[bot]` }),
            )
            .then((userInfoReq) => Object.freeze(userInfoReq.data));
    }

    private createOctokit(options: ConstructorParameters<typeof Octokit>[0]): Octokit {
        return new Octokit({
            log: {
                debug: (message: string) => this.logger.debug(message),
                info: (message: string) => this.logger.log(message),
                warn: (message: string) => this.logger.warn(message),
                error: (message: string) => this.logger.error(message),
            },
            userAgent: 'EhTagTranslation Nest',
            ...options,
        });
    }
    private readonly APP_INSTALLATION_ID = Number.parseInt(this.config.get('APP_INSTALLATION_ID', ''));
    private readonly APP_ID = Number.parseInt(this.config.get('APP_ID', '0'));
    private readonly APP_KEY: string = this.config.get('APP_KEY', '');
    private readonly APP_CLIENT_ID: string = this.config.get('APP_CLIENT_ID', '');
    private readonly APP_CLIENT_SECRET: string = this.config.get('APP_CLIENT_SECRET', '');

    private readonly EDITOR_CLIENT_ID: string = this.config.get('EDITOR_CLIENT_ID', '');
    private readonly EDITOR_CLIENT_SECRET: string = this.config.get('EDITOR_CLIENT_SECRET', '');

    readonly forApp = this.createOctokit({
        authStrategy: createAppAuth,
        auth: {
            appId: this.APP_ID,
            privateKey: this.APP_KEY,
            clientId: this.APP_CLIENT_ID,
            clientSecret: this.APP_CLIENT_SECRET,
            installationId: this.APP_INSTALLATION_ID,
        } as StrategyOptions,
    });

    readonly forOauth = createOAuthAppAuth({
        clientId: this.EDITOR_CLIENT_ID,
        clientSecret: this.EDITOR_CLIENT_SECRET,
    });

    private appToken?: Promise<ApiData<'apps', 'createInstallationAccessToken'>>;
    async getAppToken(): Promise<string> {
        const currentQuery = await this.appToken;
        if (currentQuery && Date.parse(currentQuery.expires_at) > Date.now() + 600_000) {
            return currentQuery.token;
        }

        const tokenReq = this.forApp.apps.createInstallationAccessToken({
            installation_id: this.APP_INSTALLATION_ID,
        });
        this.appToken = tokenReq.then((token) => token.data);
        return (await this.appToken).token;
    }
    forUser(userToken: string): Octokit {
        return this.createOctokit({
            auth: userToken,
        });
    }
    async user(userToken: string): Promise<UserInfo> {
        const cache = this.userInfoCache.get<UserInfo>(userToken);
        if (cache) return cache;

        const user = Object.freeze((await this.forUser(userToken).users.getAuthenticated()).data);
        this.userInfoCache.set(userToken, user);
        return user;
    }

    private readonly userInfoCache = new Cache({
        stdTTL: 3600,
        checkperiod: 0,
        useClones: false,
    });
    private _appInfo!: Promise<AppInfo>;
    private _botUserInfo!: Promise<UserInfo>;

    async appInfo(): Promise<AppInfo> {
        return this._appInfo;
    }

    async botUserInfo(): Promise<UserInfo> {
        return this._botUserInfo;
    }
}
