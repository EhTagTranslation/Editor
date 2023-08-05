import {
    type CanActivate,
    type ExecutionContext,
    Injectable,
    UnauthorizedException,
    ForbiddenException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { RequestError } from '@octokit/request-error';
import type { FastifyRequest } from 'fastify';
import { InjectableBase } from '../injectable-base.js';
import { OctokitService, type UserInfo } from '../octokit/octokit.service.js';

/* 账号最少需要注册后 15 天 */
const DEFAULT_MIN_ACCOUNT_AGE = 15 * 24 * 60 * 60 * 1000;

@Injectable()
export class GithubIdentityGuard extends InjectableBase implements CanActivate {
    constructor(
        private readonly octokit: OctokitService,
        private readonly config: ConfigService,
    ) {
        super();
    }
    async isBlocked(user: UserInfo): Promise<boolean> {
        try {
            const response = await this.octokit.forApp.orgs.checkBlockedUser({
                org: this.octokit.owner,
                username: user.login,
            });
            return response.status === 204;
        } catch (ex) {
            if ((ex as RequestError).status === 404) return false;
            throw ex;
        }
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const http = context.switchToHttp();
        const request = http.getRequest<FastifyRequest>();
        let token = request.headers['authorization'] ?? (request.query as Record<string, string>)['access_token'];
        if (!token) return true;
        if (typeof token != 'string') throw new UnauthorizedException('用户 TOKEN 无效，请重新登录。');
        token = token.trim();
        if (/^bearer\s+/i.test(token)) token = token.slice(6).trimStart();
        if (token.length < 8) throw new UnauthorizedException('用户 TOKEN 无效，请重新登录。');
        let user;
        try {
            user = await this.octokit.user(token);
        } catch {
            throw new UnauthorizedException('用户信息无效，请重新登录。');
        }
        if (
            Date.parse(user.created_at) >=
            Date.now() - Number(this.config.get('MIN_ACCOUNT_AGE', DEFAULT_MIN_ACCOUNT_AGE))
        ) {
            throw new ForbiddenException('用户注册时间过短。');
        }
        if (await this.isBlocked(user)) {
            throw new ForbiddenException('用户已被封禁。');
        }
        Object.defineProperty(request, 'user', {
            value: user,
            configurable: true,
        });
        this.logger.debug(JSON.stringify(user));
        return true;
    }
}
