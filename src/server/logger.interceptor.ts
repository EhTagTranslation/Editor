import { CallHandler, ExecutionContext, Injectable, NestInterceptor, HttpException } from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import { Observable } from 'rxjs';
import { InjectableBase } from './injectable-base';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggerInterceptor extends InjectableBase implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler<unknown>): Observable<unknown> {
        const httpContext = context.switchToHttp();
        const req = httpContext.getRequest<FastifyRequest>();
        const message = `[${String(req.id).padStart(4)}] ${req.req.method ?? '???'} ${req.req.url ?? ''}`;
        this.logger.verbose(message);
        return next.handle().pipe(
            tap(
                () => this.logger.verbose(message + ' OK'),
                (e) => {
                    if (e instanceof HttpException) this.logger.verbose(`${message} ERROR ${e.getStatus()}`);
                    else this.logger.verbose(message + ' ERROR');
                },
            ),
        );
    }
}
