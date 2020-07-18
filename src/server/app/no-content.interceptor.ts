import { CallHandler, ExecutionContext, Injectable, NestInterceptor, HttpStatus } from '@nestjs/common';
import { FastifyReply } from 'fastify';
import { Observable } from 'rxjs';
import { InjectableBase } from '../injectable-base';
import { tap } from 'rxjs/operators';

@Injectable()
export class NoContentInterceptor extends InjectableBase implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler<unknown>): Observable<unknown> {
        return next.handle().pipe(
            tap((r) => {
                if (r === null) {
                    const httpContext = context.switchToHttp();
                    const res = httpContext.getResponse<FastifyReply<unknown>>();
                    res.status(HttpStatus.NO_CONTENT).send();
                }
            }),
        );
    }
}
