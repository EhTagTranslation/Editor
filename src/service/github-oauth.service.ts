import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tokenKey } from '@angular/core/src/view';
import { Observable, of, from } from 'rxjs';

const clientId = '2f2070671bda676ddb5a';
const windowName = 'githubOauth';
const localStorageKey = 'github_oauth_token';

export interface GithubUser
{
  login: string;
  id: number;
  node_id: string;
  avatar_url: string;
  gravatar_id: string;
  url: string;
  html_url: string;
  followers_url: string;
  following_url: string;
  gists_url: string;
  starred_url: string;
  subscriptions_url: string;
  organizations_url: string;
  repos_url: string;
  events_url: string;
  received_events_url: string;
  type: string;
  site_admin: boolean;
  name: string;
  company: string;
  blog: string;
  location: string;
  email?: any;
  hireable?: any;
  bio: string;
  public_repos: number;
  public_gists: number;
  followers: number;
  following: number;
  created_at: Date;
  updated_at: Date;
}

export interface Signature
{
  name: string;
  email: string;
  when: Date;
}

export interface Commit
{
  author: Signature;
  committer: Signature;
  sha: string;
  message: string;
}

export interface Row
{
  namespace: string;
  count: number;
}

export interface RepoInfo
{
  repo: string;
  head: Commit;
  version: number;
  data: Row[];
}

@Injectable({
  providedIn: 'root'
})
export class GithubOauthService
{
  constructor(
    private httpClient: HttpClient,
  ) { }

  get token()
  {
    return localStorage.getItem(localStorageKey);
  }

  set token(value: string)
  {
    localStorage.setItem(localStorageKey, value || '');
  }

  getRepoInfo()
  {
    return this.httpClient.get<RepoInfo>('http://ehtagconnector.azurewebsites.net/api/database').toPromise();
  }

  async getCurrentUser()
  {
    const token = this.token;
    if (!token)
    {
      throw new Error('Need log in.');
    }
    try
    {
      return await this.httpClient.get<GithubUser>(`https://api.github.com/user?access_token=${token}`).toPromise();
    }
    catch (ex)
    {
      if (ex.status === 401)
      {
        if (this.token === token)
        {
          // token is invalid.
          this.token = null;
        }
      }
      throw ex;
    }
  }

  logInIfNeeded()
  {
    if (this.token)
    {
      return Promise.resolve();
    }
    return new Promise<void>((resolve, reject) =>
    {
      const callback = location.origin + location.pathname + 'assets/callback.html';
      const authWindow = window.open(
        `https://github.com/login/oauth/authorize?client_id=${clientId}&scope=&redirect_uri=${callback}`,
        windowName,
        'toolbar=no,location=no,status=no,menubar=no,scrollbars=no,resizable=no,width=640,height=720');
      window.addEventListener('message', async ev =>
      {
        if (ev.source !== authWindow)
        {
          return;
        }
        const code = ev.data.code as string;
        if (!code)
        {
          return;
        }
        try
        {
          interface AuthCallback { token: string; }
          const r = await this.httpClient.get<AuthCallback>(`https://ehtageditor.azurewebsites.net/authenticate/${code}`).toPromise();
          this.token = r.token;
          resolve();
        }
        catch (ex)
        {
          reject(ex);
        }
      });
    });
  }

  logOut()
  {
    this.token = null;
  }
}
