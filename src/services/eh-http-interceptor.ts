import { Injectable, ClassProvider, isDevMode } from '@angular/core';
import { catchError, mergeMap, tap, retry, map, flatMap } from 'rxjs/operators';
import {
  HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HTTP_INTERCEPTORS, HttpEventType, HttpErrorResponse, HttpResponseBase
} from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { GithubOauthService } from './github-oauth.service';
import { EhTagConnectorService } from './eh-tag-connector.service';
import { ApiEndpointService } from './api-endpoint.service';
import { DebugService } from './debug.service';

@Injectable()
export class EhHttpInterceptor implements HttpInterceptor {

  constructor(
    private githubOauth: GithubOauthService,
    private ehTagConnector: EhTagConnectorService,
    private endpoints: ApiEndpointService,
    private debug: DebugService,
  ) { }

  private handleEag(response: HttpResponseBase) {
    if (!response.url || !response.url.startsWith(this.endpoints.ehTagConnectorDb())) { return; }
    const etagV = response.headers.get('etag');
    if (!etagV) { return; }
    // `W/` might be added by some CDN
    const etag = (etagV.match(/^(W\/)?"(\w+)"$/) || [])[2];
    if (etag) {
      this.ehTagConnector.hash = etag;
    }
  }

  private handleError(response: HttpErrorResponse) {
    if (!response.url) { return; }
    if (response.url.startsWith(this.endpoints.github())) {
      if (response.status === 400 || response.status === 401) {
        // token is invalid
        this.githubOauth.logOut();
      }
    }
  }

  private getReq(req: HttpRequest<any>) {
    let authReq = req;
    const token = this.githubOauth.token;

    if (req.url.startsWith(this.endpoints.github()) && token) {
      /**
       * use `access_token` for more rate limits
       * @see https://developer.github.com/v3/#rate-limiting
       */
      authReq = req.clone({
        setParams: { access_token: token }
      });
    }

    if (req.url.startsWith(this.endpoints.ehTagConnectorDb())) {
      const mod: Parameters<typeof req.clone>[0] = {
        setHeaders: {}
      };

      if (['POST', 'PUT', 'DELETE'].includes(req.method) && mod.setHeaders) {
        if (token) {
          mod.setHeaders['X-Token'] = token;
        }
        if (this.ehTagConnector.hash) {
          mod.setHeaders['If-Match'] = `"${this.ehTagConnector.hash}"`;
        }
      }

      authReq = req.clone(mod);
    }
    return authReq;
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const r = of(req).pipe(
      map(rawReq => this.getReq(rawReq)),
      flatMap(authReq => next.handle(authReq)),
      tap(response => {
        if (response.type === HttpEventType.Response) {
          this.handleEag(response);
        }
      }),
      catchError(err => {
        this.debug.error('catchError', err);
        if (err.name === HttpErrorResponse.name) {
          this.handleEag(err);
          this.handleError(err);
        }
        throw err;
      }),
      retry(1)
    );
    return r;
  }
}

export const ehHttpInterceptorProvider: ClassProvider = { provide: HTTP_INTERCEPTORS, useClass: EhHttpInterceptor, multi: true };
