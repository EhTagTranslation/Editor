import {
    type CallHandler,
    type ExecutionContext,
    Injectable,
    type NestInterceptor,
    HttpException,
} from '@nestjs/common';
import type { FastifyRequest } from 'fastify';
import type { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { InjectableBase } from '../injectable-base.js';

@Injectable()
export class LoggerInterceptor extends InjectableBase implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler<unknown>): Observable<unknown> {
        const httpContext = context.switchToHttp();
        const req = httpContext.getRequest<FastifyRequest>();
        const id = String(req.headers['x-request-id'] ?? req.id);
        const start = Date.now();
        const message = `[${id}] ${req.method} ${req.url}`;
        this.logger.verbose(`RECV ${message}`);
        return next.handle().pipe(
            tap(
                () => {
                    const elapsed = Date.now() - start;
                    this.logger.verbose(`SENT ${message} OK - ${elapsed}ms`);
                },
                (e) => {
                    const elapsed = Date.now() - start;
                    if (e instanceof HttpException) {
                        this.logger.warn(`SENT ${message} ERROR - ${elapsed}ms ${e.getStatus()}`);
                    } else {
                        this.logger.error(`SENT ${message} ERROR - ${elapsed}ms ${String(e)}`);
                    }
                },
            ),
        );
    }
}
