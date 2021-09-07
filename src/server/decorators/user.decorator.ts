import { createParamDecorator, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import type { FastifyRequest } from 'fastify';
import { ApiBearerAuth } from '@nestjs/swagger';
import { __decorate } from 'tslib';
import type { UserInfo } from '../octokit/octokit.service';

export const User = createParamDecorator<void, ExecutionContext, UserInfo>(
    (_: void, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest<FastifyRequest>();
        const user = (request as { user?: UserInfo }).user;
        if (!user) {
            throw new UnauthorizedException('No token.');
        }
        return user;
    },
    [
        (target, key) => {
            __decorate([ApiBearerAuth('GitHub Token')], target, key, null);
        },
    ],
);
