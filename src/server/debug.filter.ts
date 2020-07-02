import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus, HttpServer, Logger } from '@nestjs/common';
import { BaseExceptionFilter, AbstractHttpAdapter } from '@nestjs/core';

@Catch()
export class DebugFilter extends BaseExceptionFilter<Error> implements ExceptionFilter {
    handleUnknownError(exception: Error, host: ArgumentsHost, applicationRef: AbstractHttpAdapter | HttpServer): void {
        const body = {
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            message: exception.message ?? String(exception),
            stack: exception.stack,
            errorName: exception.name,
        };
        applicationRef.reply(host.getArgByIndex(1), body, body.statusCode);
        if (this.isExceptionObject(exception)) {
            this.logger.error(exception.message, exception.stack);
        }
        this.logger.error(exception);
    }

    private readonly logger = new Logger(DebugFilter.name);
}
