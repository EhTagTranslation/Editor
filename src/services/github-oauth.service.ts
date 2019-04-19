import { Injectable, isDevMode, EventEmitter } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GithubUser } from '../interfaces/github';
import { ETRepoInfo } from 'src/interfaces/ehtranslation';
import { ApiEndpointService } from './api-endpoint.service';
import { Location } from '@angular/common';
import { Observable, of, from, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { resolve } from 'bluebird';

const clientId = '2f2070671bda676ddb5a';
const windowName = 'githubOauth';
const localStorageKey = 'github_oauth_token';


interface TokenData { token: string; error: any; }

@Injectable({
  providedIn: 'root'
})
export class GithubOauthService {
  constructor(
    private httpClient: HttpClient,
    private location: Location,
    private endpoints: ApiEndpointService,
  ) {
    // make sure `token` is valid
    this.setToken(this.token || undefined);
    if (isDevMode()) {
      globalThis.setToken = this.setToken.bind(this);
    }
  }

  tokenChange: EventEmitter<string | null> = new EventEmitter();
  get token() {
    return localStorage.getItem(localStorageKey);
  }

  private setToken(value?: string) {
    if (!value || !value.match(/^\w+$/)) {
      localStorage.removeItem(localStorageKey);
      this.tokenChange.emit(null);
    } else {
      localStorage.setItem(localStorageKey, value);
      this.tokenChange.emit(value);
    }
  }

  /**
   * @see https://developer.github.com/v3/users/#get-the-authenticated-user
   */
  getCurrentUser() {
    const token = this.token;
    if (!token) {
      return of(null);
    }
    return this.httpClient.get<GithubUser>(this.endpoints.github('user'))
      .pipe(catchError(error => {
        if (error.status === 401 && this.token === token) {
          // token is invalid.
          this.setToken();
        }
        return of(null);
      }));
  }
  /**
   * @returns `true` for succeed login, `false` if has been logged in.
   */
  logInIfNeeded() {
    if (this.token) {
      return of(false);
    }
    const callback = new URL(this.location.prepareExternalUrl('/assets/callback.html'), window.location.href);
    const authWindow = window.open(
      `https://github.com/login/oauth/authorize?client_id=${clientId}&scope=&redirect_uri=${encodeURIComponent(callback.href)}`,
      windowName,
      'toolbar=no,location=no,status=no,menubar=no,scrollbars=no,resizable=no,width=640,height=720');
    if (!authWindow) {
      return throwError(new Error('Failed to open new window.'));
    }

    const authChecker = new Promise<void>(res => {
      const authTick = setInterval(() => {
        if (authWindow.closed) {
          clearInterval(authTick);
          res();
        }
      }, 500);
    });

    const promise = new Promise<string>((res, rej) => {
      const onMessage = (ev: MessageEvent) => {
        if (ev.source !== authWindow) {
          return;
        }
        res(ev.data as string);
        window.removeEventListener('message', onMessage);
      };
      authChecker.then(() => {
        window.removeEventListener('message', onMessage);
        rej(new Error('Auth window closed.'));
      });
      window.addEventListener('message', onMessage);
    })
      .then(code => this.httpClient.get<TokenData>(`https://ehtageditor.azurewebsites.net/authenticate/${code}`).toPromise())
      .catch(error => ({ token: null, error }))
      .then(token => {
        if (!token.token || token.error) {
          throw token.error || token;
        }
        this.setToken(token.token);
        return true;
      });
    return from(promise);
  }

  logOut() {
    this.setToken();
  }

  /**
   * Directing users to review their access
   * @see https://developer.github.com/apps/building-oauth-apps/authorizing-oauth-apps/#directing-users-to-review-their-access
   */
  get reviewUrl() { return `https://github.com/settings/connections/applications/${clientId}`; }
}
