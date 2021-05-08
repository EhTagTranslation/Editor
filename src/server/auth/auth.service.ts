import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectableBase } from '../injectable-base';
import { OctokitService } from '../octokit/octokit.service';
import { Authentication, AuthOptions } from '@octokit/auth-oauth-app/dist-types/types';
export { Authentication };

@Injectable()
export class AuthService extends InjectableBase {
    constructor(private readonly config: ConfigService, private readonly octokit: OctokitService) {
        super();
    }

    async getAccessToken(code: string, state?: string): Promise<Authentication> {
        const conf: AuthOptions = {
            type: 'token',
            code,
        };
        if (state) conf.state = state;
        return await this.octokit.forOauth(conf);
    }
}
