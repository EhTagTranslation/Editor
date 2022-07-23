import { CanActivate, ExecutionContext, Injectable, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { FastifyRequest } from 'fastify';
import { InjectableBase } from '../injectable-base.js';
import { OctokitService } from '../octokit/octokit.service.js';

/* 账号最少需要注册后 15 天 */
const DAFAULT_MIN_ACCOUNT_AGE = 15 * 24 * 60 * 60 * 1000;

@Injectable()
export class GithubIdentityGuard extends InjectableBase implements CanActivate {
    constructor(private readonly octokit: OctokitService, private readonly config: ConfigService) {
        super();
    }
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const http = context.switchToHttp();
        const request = http.getRequest<FastifyRequest>();
        let token = request.headers['authorization'] ?? (request.query as Record<string, string>)['access_token'];
        if (!token) return true;
        if (typeof token != 'string') throw new UnauthorizedException('Invalid token.');
        token = token.trim();
        if (/^bearer\s+/i.test(token)) token = token.slice(6).trimStart();
        if (token.length < 8) throw new UnauthorizedException('Invalid token.');
        let user;
        try {
            user = await this.octokit.user(token);
        } catch {
            throw new UnauthorizedException('Bad token.');
        }
        if (
            Date.parse(user.created_at) >=
            Date.now() - Number(this.config.get('MIN_ACCOUNT_AGE', DAFAULT_MIN_ACCOUNT_AGE))
        ) {
            throw new ForbiddenException('Account age too young.');
        }
        Object.defineProperty(request, 'user', {
            value: user,
            configurable: true,
        });
        return true;
    }
}
