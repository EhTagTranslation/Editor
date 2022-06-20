import { CallHandler, ExecutionContext, Injectable, NestInterceptor, HttpException, HttpStatus } from '@nestjs/common';
import type { FastifyRequest, FastifyReply } from 'fastify';
import { Observable, from, throwError, of } from 'rxjs';
import { map, mergeMap, delayWhen, catchError } from 'rxjs/operators';
import { InjectableBase } from '../injectable-base.js';
import { DatabaseService } from '../database/database.service.js';

function getSha(etag: unknown): string | undefined {
    if (typeof etag != 'string') return undefined;
    const match = /^\s*(W\/)?\s*"?([a-f0-9]{40})"?\s*$/i.exec(etag);
    return match?.[2]?.toLowerCase();
}

@Injectable()
export class EtagInterceptor extends InjectableBase implements NestInterceptor<unknown, unknown> {
    constructor(private readonly database: DatabaseService) {
        super();
    }

    intercept(context: ExecutionContext, next: CallHandler<unknown>): Observable<unknown> {
        const httpContext = context.switchToHttp();
        const req = httpContext.getRequest<FastifyRequest>();
        const res = httpContext.getResponse<FastifyReply>();

        const setEtag = (): Observable<void> =>
            from(
                this.database.data.sha().then((sha) => {
                    void res.header('ETag', `"${sha}"`);
                }),
            );

        return from(this.database.data.sha()).pipe(
            map((sha) => {
                if (!req.method) return;
                switch (req.method.toUpperCase()) {
                    default:
                    case 'GET':
                    case 'HEAD': {
                        const match = req.headers['if-none-match'] as unknown;
                        if (!match) return;
                        if (sha !== getSha(match)) return;
                        void res.status(HttpStatus.NOT_MODIFIED).send();
                        this.logger.verbose('Sent 304');
                        return true;
                    }
                    case 'POST':
                    case 'PUT':
                    case 'PATCH':
                    case 'DELETE': {
                        const match = req.headers['if-match'] as unknown;
                        if (!match) {
                            if (req.headers['x-github-delivery'] && req.headers['x-github-event']) return;
                            throw new HttpException(
                                HttpException.createBody(
                                    "'If-Match' header is not present, use corresponding GET api to retrieve the ETag.",
                                    'Precondition required',
                                    428,
                                ),
                                428,
                            );
                        }
                        if (sha !== getSha(match)) {
                            throw new HttpException(
                                HttpException.createBody(
                                    'The wiki has been modified, use corresponding GET api to renew the ETag.',
                                    'Precondition failed',
                                    HttpStatus.PRECONDITION_FAILED,
                                ),
                                HttpStatus.PRECONDITION_FAILED,
                            );
                        }
                        return;
                    }
                }
            }),
            mergeMap((sent) => (sent ? of('') : next.handle())),
            catchError((err: unknown) => {
                if (err instanceof HttpException && err.getStatus() === HttpStatus.NOT_FOUND) {
                    return setEtag().pipe(mergeMap(() => throwError(err)));
                }
                return throwError(() => err);
            }),
            delayWhen(setEtag),
        );
    }
}
