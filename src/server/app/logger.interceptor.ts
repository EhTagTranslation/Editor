import { CallHandler, ExecutionContext, Injectable, NestInterceptor, HttpException } from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import { Observable } from 'rxjs';
import { InjectableBase } from '../injectable-base';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggerInterceptor extends InjectableBase implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler<unknown>): Observable<unknown> {
        const httpContext = context.switchToHttp();
        const req = httpContext.getRequest<FastifyRequest>();
        const start = Date.now();
        const message = `[${String(req.id)}] ${req.req.method ?? '???'} ${req.req.url ?? ''}`;
        return next.handle().pipe(
            tap(
                () => {
                    const elapsed = Date.now() - start;
                    this.logger.verbose(`${message} OK - ${elapsed}ms`);
                },
                (e) => {
                    const elapsed = Date.now() - start;
                    if (e instanceof HttpException) {
                        this.logger.warn(`${message} ERROR - ${elapsed}ms ${e.getStatus()}`);
                    } else {
                        this.logger.error(`${message} ERROR - ${elapsed}ms ${String(e)}`);
                    }
                },
            ),
        );
    }
}
