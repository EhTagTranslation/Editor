import { createParamDecorator, UnauthorizedException } from '@nestjs/common';
import type { FastifyRequest } from 'fastify';
import { ApiBearerAuth } from '@nestjs/swagger';
import { __decorate } from 'tslib';
import type { UserInfo } from '../octokit/octokit.service.js';

export const User = createParamDecorator<unknown, UserInfo>(
    (_, ctx) => {
        const request = ctx.switchToHttp().getRequest<FastifyRequest>();
        const { user } = request as { user?: UserInfo };
        if (!user) {
            throw new UnauthorizedException('没有用户信息，请重新登录。');
        }
        return user;
    },
    [
        (target, key) => {
            __decorate([ApiBearerAuth('GitHub Token')], target, key, null);
        },
    ],
);
