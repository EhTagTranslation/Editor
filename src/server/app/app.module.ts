import { Module, ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD, APP_PIPE, APP_INTERCEPTOR, APP_FILTER } from '@nestjs/core';
import { DatabaseModule } from '../database/database.module';
import { ToolsModule } from '../tools/tools.module';
import { LoggerInterceptor } from './logger.interceptor';
import { OctokitModule } from '../octokit/octokit.module';
import { GithubIdentityGuard } from './github-identity.guard';
import { NoContentInterceptor } from './no-content.interceptor';
import { DebugFilter } from './debug.filter';

@Module({
    imports: [ConfigModule.forRoot({ isGlobal: true }), DatabaseModule, ToolsModule, OctokitModule],
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
            provide: APP_INTERCEPTOR,
            useClass: NoContentInterceptor,
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
