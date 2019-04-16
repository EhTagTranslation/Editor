import { Injectable, ClassProvider, isDevMode } from '@angular/core';
import { catchError, mergeMap, tap } from 'rxjs/operators';
import {
  HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HTTP_INTERCEPTORS, HttpEventType, HttpErrorResponse, HttpResponseBase
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { GithubOauthService } from './github-oauth.service';
import { EhTagConnectorService } from './eh-tag-connector.service';
import { ApiEndpointService } from './api-endpoint.service';

@Injectable()
export class EhHttpInterceptor implements HttpInterceptor {

  constructor(
    private githubOauth: GithubOauthService,
    private ehTagConnector: EhTagConnectorService,
    private endpoints: ApiEndpointService,
  ) { }

  private static debugLog(category: string, data: any) {
    // if (isDevMode()) {
    //   console.log(category, data);
    // }
  }

  private handleEag(response: HttpResponseBase) {
    if (response.url.startsWith(this.endpoints.ehTagConnector())) {
      // `W/` might be added by some CDN
      const etag = (response.headers.get('etag').match(/^(W\/)?"(\w+)"$/) || [])[2];
      if (etag) {
        EhHttpInterceptor.debugLog('etag', etag);
        this.ehTagConnector.hash = etag;
      }
    }
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
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

    if (req.url.startsWith(this.endpoints.ehTagConnector())) {
      const mod: Parameters<typeof req.clone>[0] = {
        setHeaders: {}
      };

      if (['POST', 'PUT', 'DELETE'].includes(req.method)) {
        if (token) {
          mod.setHeaders['X-Token'] = token;
        }
        if (this.ehTagConnector.hash) {
          mod.setHeaders['If-Match'] = `"${this.ehTagConnector.hash}"`;
        }
      }

      authReq = req.clone(mod);
    }

    EhHttpInterceptor.debugLog('req', authReq);
    return next.handle(authReq).pipe(
      tap(response => {
        EhHttpInterceptor.debugLog('tap', response);
        if (response.type === HttpEventType.Response) {
          this.handleEag(response);
        }
      }),
      catchError(err => {
        EhHttpInterceptor.debugLog('catchError', err);
        if (err.name === HttpErrorResponse.name) {
          this.handleEag(err);
        }
        throw err;
      })
    );
  }
}

export const ehHttpInterceptorProvider: ClassProvider = { provide: HTTP_INTERCEPTORS, useClass: EhHttpInterceptor, multi: true };
