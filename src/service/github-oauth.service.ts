import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GithubUser } from '../interfaces/github-user';
import { ETRepoInfo } from 'src/interfaces/interface';
import { ApiEndpointService } from './api-endpoint.service';

const clientId = '2f2070671bda676ddb5a';
const windowName = 'githubOauth';
const localStorageKey = 'github_oauth_token';


@Injectable({
  providedIn: 'root'
})
export class GithubOauthService {
  constructor(
    private httpClient: HttpClient,
    private endpoints: ApiEndpointService,
  ) {
    // make sure `token` is valid
    this.setToken(this.token);
  }

  get token() {
    return localStorage.getItem(localStorageKey);
  }

  private setToken(value?: string) {
    if (!value || !value.match(/^\w+$/)) {
      localStorage.removeItem(localStorageKey);
    } else {
      localStorage.setItem(localStorageKey, value);
    }
  }

  /**
   * @see https://developer.github.com/v3/users/#get-the-authenticated-user
   */
  async getCurrentUser() {
    const token = this.token;
    if (!token) {
      throw new Error('Need log in.');
    }
    try {
      return await this.httpClient.get<GithubUser>(this.endpoints.github + 'user').toPromise();
    } catch (ex) {
      if (ex.status === 401 && this.token === token) {
        // token is invalid.
        this.setToken();
      }
      throw ex;
    }
  }

  /**
   * @returns `true` for succeed login, `false` if has been logged in.
   */
  logInIfNeeded() {
    if (this.token) {
      return Promise.resolve(false);
    }
    return new Promise<boolean>((resolve, reject) => {
      const callback = location.origin + location.pathname + 'assets/callback.html';
      const authWindow = window.open(
        `https://github.com/login/oauth/authorize?client_id=${clientId}&scope=&redirect_uri=${callback}`,
        windowName,
        'toolbar=no,location=no,status=no,menubar=no,scrollbars=no,resizable=no,width=640,height=720');
      const onMessage = async (ev: MessageEvent) => {
        if (ev.source !== authWindow) {
          return;
        }
        const code = ev.data.code as string;
        if (!code) {
          return;
        }
        try {
          interface AuthCallback { token: string; }
          const r = await this.httpClient.get<AuthCallback>(`https://ehtageditor.azurewebsites.net/authenticate/${code}`).toPromise();
          this.setToken(r.token);
          resolve(true);
        } catch (ex) {
          reject(ex);
        }
        window.removeEventListener('message', onMessage);
      };
      window.addEventListener('message', onMessage);
    });
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
