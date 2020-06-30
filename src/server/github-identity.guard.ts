import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import { InjectableBase } from './injectable-base';
import { OctokitService } from './octokit/octokit.service';

@Injectable()
export class GithubIdentityGuard extends InjectableBase implements CanActivate {
    constructor(private readonly octokit: OctokitService) {
        super();
    }
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const http = context.switchToHttp();
        const request = http.getRequest<FastifyRequest>();
        let token = ((request.headers['x-token'] ??
            request.headers['authorization'] ??
            request.query.access_token) as string)
            ?.trim()
            .toLowerCase();
        if (!token) return true;
        if (token.startsWith('bearer')) token = token.slice(6).trimLeft();
        if (!/^[a-f0-9]{8,}$/i.test(token)) throw new UnauthorizedException('Invalid token.');
        try {
            const user = await this.octokit.user(token);
            Object.defineProperty(request, 'user', {
                value: user,
                enumerable: true,
                writable: false,
            });
            return true;
        } catch {
            throw new UnauthorizedException('Bad token.');
        }
    }
}
