import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { OAuthAppUserAuthentication, WebFlowAuthOptions } from '@octokit/auth-oauth-app/dist-types/types';
import { InjectableBase } from '../injectable-base.js';
import { OctokitService } from '../octokit/octokit.service.js';

export type { OAuthAppUserAuthentication as Authentication };

@Injectable()
export class AuthService extends InjectableBase {
    constructor(
        private readonly config: ConfigService,
        private readonly octokit: OctokitService,
    ) {
        super();
    }

    async getAccessToken(code: string, state?: string): Promise<OAuthAppUserAuthentication> {
        const conf: WebFlowAuthOptions = {
            type: 'oauth-user',
            code,
        };
        if (state) conf.state = state;
        return await this.octokit.forOauth(conf);
    }
}
