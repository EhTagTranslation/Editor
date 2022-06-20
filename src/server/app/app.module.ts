import { Module, ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD, APP_PIPE, APP_INTERCEPTOR, APP_FILTER } from '@nestjs/core';
import { DatabaseModule } from '../database/database.module.js';
import { ToolsModule } from '../tools/tools.module.js';
import { OctokitModule } from '../octokit/octokit.module.js';
import { AuthModule } from '../auth/auth.module.js';
import { GithubIdentityGuard } from './github-identity.guard.js';
import { DebugFilter } from './debug.filter.js';
import { LoggerInterceptor } from './logger.interceptor.js';

@Module({
    imports: [ConfigModule.forRoot({ isGlobal: true }), DatabaseModule, ToolsModule, OctokitModule, AuthModule],
    providers: [
        {
            provide: APP_PIPE,
            useValue: new ValidationPipe({
                transform: true,
                whitelist: true,
            }),
        },
        {
            provide: APP_INTERCEPTOR,
            useClass: LoggerInterceptor,
        },
        {
            provide: APP_GUARD,
            useClass: GithubIdentityGuard,
        },
        {
            provide: APP_FILTER,
            useClass: DebugFilter,
        },
    ],
})
/**
 * 主模块
 */
export class AppModule {}
