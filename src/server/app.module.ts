import { Module, ValidationPipe } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD, APP_PIPE, APP_INTERCEPTOR } from '@nestjs/core';
import { DatabaseModule } from './database/database.module';
import { ToolsModule } from './tools/tools.module';
import { LoggerInterceptor } from './logger.interceptor';
import { OctokitModule } from './octokit/octokit.module';
import { GithubIndentityGuard } from './github-indentity.guard';
import { NoContentInterceptor } from './no-content.interceptor';

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
            useClass: GithubIndentityGuard,
        },
    ],
})
/**
 * 主模块
 */
export class AppModule {}
