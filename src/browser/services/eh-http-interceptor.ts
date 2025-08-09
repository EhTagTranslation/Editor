import { Injectable, type ClassProvider } from '@angular/core';
import { mergeMap, tap, map, retry } from 'rxjs/operators';
import {
    type HttpEvent,
    HttpHandler,
    type HttpInterceptor,
    HttpRequest,
    HTTP_INTERCEPTORS,
    HttpEventType,
    HttpErrorResponse,
    HttpResponseBase,
} from '@angular/common/http';
import { Observable, of, throwError, timer } from 'rxjs';
import { GithubOauthService } from './github-oauth.service';
import { EhTagConnectorService } from './eh-tag-connector.service';
import { ApiEndpointService } from './api-endpoint.service';
import { DebugService } from './debug.service';

function isHttpErrorResponse(error: Error): error is HttpErrorResponse {
    return error.name === 'HttpErrorResponse';
}

@Injectable()
export class EhHttpInterceptor implements HttpInterceptor {
    constructor(
        private readonly githubOauth: GithubOauthService,
        private readonly ehTagConnector: EhTagConnectorService,
        private readonly endpoints: ApiEndpointService,
        private readonly debug: DebugService,
    ) {}

    private handleEtag(response: HttpResponseBase): void {
        if (!response.url?.startsWith(this.endpoints.ehTagConnectorDb())) {
            return;
        }
        const etagV = response.headers.get('etag');
        if (!etagV) {
            return;
        }
        this.debug.log('http: etag', etagV, 'from response', response);
        // `W/` might be added by some CDN
        const etag = (/^(W\/)?"?(\w+)"?$/.exec(etagV) ?? [])[2];
        if (etag) {
            this.ehTagConnector.hash = etag;
        }
    }

    private handleError(response: HttpErrorResponse): void {
        if (!response.url) {
            return;
        }
        if (response.url.startsWith(this.endpoints.github())) {
            if (response.status === 400 || response.status === 401) {
                // token is invalid
                this.githubOauth.logOut();
            }
        }
    }

    private getReq(req: HttpRequest<unknown>): HttpRequest<unknown> {
        const mod: Parameters<typeof req.clone>[0] = {
            setHeaders: {},
            setParams: {},
        };
        if (!mod.setHeaders || !mod.setParams) {
            return req;
        }
        const { token } = this.githubOauth;
        if (req.url.startsWith(this.endpoints.github())) {
            mod.setHeaders['Accept'] = `application/vnd.github.v3+json`;
            if (token) {
                /**
                 * use `token` for more rate limits
                 * @see https://developer.github.com/v3/#rate-limiting
                 */
                mod.setHeaders['Authorization'] = `token ${token}`;
            }
        } else if (req.url.startsWith(this.endpoints.ehTagConnectorDb())) {
            if (['POST', 'PUT', 'DELETE'].includes(req.method) && mod.setHeaders) {
                if (token) {
                    mod.setHeaders['Authorization'] = `Bearer ${token}`;
                }
                if (this.ehTagConnector.hash) {
                    mod.setHeaders['If-Match'] = `"${this.ehTagConnector.hash}"`;
                }
            }
        }
        return req.clone(mod);
    }

    intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
        const r = of(req).pipe(
            map((rawReq) => this.getReq(rawReq)),
            mergeMap((authReq) => next.handle(authReq)),
            tap({
                next: (response) => {
                    if (response.type === HttpEventType.Response) {
                        this.handleEtag(response);
                    }
                },
                error: (error: Error) => {
                    this.debug.error('catchError', error);
                    if (isHttpErrorResponse(error)) {
                        this.handleEtag(error);
                        this.handleError(error);
                    }
                },
            }),
            retry({
                delay: (error: Error, retryCount) => {
                    if (
                        !isHttpErrorResponse(error) ||
                        retryCount !== 0 ||
                        (error.status < 500 && error.status !== 401 && error.status !== 403) ||
                        error.headers.get('X-RateLimit-Remaining') === '0'
                    ) {
                        return throwError(() => error);
                    }
                    return timer(1000);
                },
            }),
        );
        return r;
    }
}

export const ehHttpInterceptorProvider: ClassProvider = {
    provide: HTTP_INTERCEPTORS,
    useClass: EhHttpInterceptor,
    multi: true,
};
