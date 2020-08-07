import { Controller, Get, Param, Query, Header, Headers, BadRequestException } from '@nestjs/common';
import { InjectableBase } from '../injectable-base';
import { AuthService, Authentication } from './auth.service';
import { ApiExcludeEndpoint } from '@nestjs/swagger';

@Controller('auth')
export class AuthController extends InjectableBase {
    constructor(readonly service: AuthService) {
        super();
    }

    @Get(':code')
    @Header('Cache-Control', 'no-cache')
    @ApiExcludeEndpoint()
    async getToken(
        @Param('code') code: string,
        @Query('state') state?: string,
        @Headers('origin') origin?: string,
        @Headers('user-agent') userAgent?: string,
    ): Promise<Authentication> {
        if (!origin || !userAgent) {
            throw new BadRequestException();
        }
        try {
            const url = new URL(origin);
            if (!url.hostname.endsWith('ehtt.now.sh')) throw new BadRequestException();
        } catch {
            throw new BadRequestException();
        }
        try {
            return await this.service.getAccessToken(code, state);
        } catch (ex) {
            const e = ex as Error;
            this.logger.error(e);
            throw new BadRequestException(e.message ?? String(e));
        }
    }
}
