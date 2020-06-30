import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectableBase } from 'server/injectable-base';
import { Octokit } from '@octokit/rest';
import { OctokitOptions } from '@octokit/core/dist-types/types';
import { ConfigService } from '@nestjs/config';
import { createAppAuth, Types } from '@octokit/auth-app';
import { AsyncReturnType } from 'type-fest';
import * as Cache from 'node-cache';
export type AppInfo = Readonly<AsyncReturnType<Octokit['apps']['getAuthenticated']>['data']>;
export type UserInfo = Readonly<AsyncReturnType<Octokit['users']['getByUsername']>['data']>;

@Injectable()
export class OctokitService extends InjectableBase implements OnModuleInit {
    constructor(private readonly config: ConfigService) {
        super();
    }
    onModuleInit(): void {
        this.getAppToken().catch((err: unknown) => this.logger.error(err));
        this._appInfo = this.forApp.apps.getAuthenticated().then((appInfoRes) => Object.freeze(appInfoRes.data));
        this._botUserInfo = this._appInfo
            .then((appInfo) => this.forApp.users.getByUsername({ username: `${appInfo.slug}[bot]` }))
            .then((userInfoReq) => Object.freeze(userInfoReq.data));
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
    private readonly APP_INSTALLATION_ID = Number.parseInt(this.config.get('APP_INSTALLATION_ID', ''));
    private readonly APP_ID = Number.parseInt(this.config.get('APP_ID', '0'));
    private readonly APP_KEY: string = this.config.get('APP_KEY', '');
    private readonly APP_CLIENT_ID: string = this.config.get('APP_CLIENT_ID', '');
    private readonly APP_CLIENT_SECRET: string = this.config.get('APP_CLIENT_SECRET', '');

    readonly forApp = this.createOctokit({
        authStrategy: createAppAuth,
        auth: {
            id: this.APP_ID,
            privateKey: this.APP_KEY,
            clientId: this.APP_CLIENT_ID,
            clientSecret: this.APP_CLIENT_SECRET,
            installationId: this.APP_INSTALLATION_ID,
        } as Types['StrategyOptions'],
    });

    private appToken?: AsyncReturnType<Octokit['apps']['createInstallationAccessToken']>['data'];
    async getAppToken(): Promise<string> {
        if (!this.appToken || Date.parse(this.appToken.expires_at) < Date.now() + 600_000) {
            const tokenRes = await this.forApp.apps.createInstallationAccessToken({
                installation_id: this.APP_INSTALLATION_ID,
            });
            this.appToken = tokenRes.data;
        }
        return this.appToken.token;
    }
    async user(userToken: string): Promise<UserInfo> {
        const cache = this.userInfoCache.get<UserInfo>(userToken);
        if (cache) return cache;

        const user = Object.freeze((await this.createOctokit({ auth: userToken }).users.getAuthenticated()).data);
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
