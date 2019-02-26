import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tokenKey } from '@angular/core/src/view';

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

export interface Head
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
  head: Head;
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
    localStorage.setItem(localStorageKey, value)
  }

  getRepoInfo()
  {
    return this.httpClient.get<RepoInfo>('http://ehtagconnector.azurewebsites.net/api/database');
  }

  getCurrentUser()
  {
    return this.httpClient.get<GithubUser>(`https://api.github.com/user?access_token=${this.token}`)
  }

  logInIfNeeded()
  {
    if (this.token)
    {
      return Promise.resolve();
    }
    return new Promise((resolve, reject) =>
    {
      const onMessage = async (ev: MessageEvent) =>
      {
        const code = ev.data.code as string;
        if (!code)
        {
          return;
        }
        try
        {
          this.httpClient.get<{ token: string }>(`https://ehtageditor.azurewebsites.net/authenticate/${code}`)
            .subscribe(v => this.token = v.token);
          resolve();
        }
        catch (ex)
        {
          reject(ex);
        }
      };
      const callback = location.origin + location.pathname + 'assets/callback.html';
      window.open(`https://github.com/login/oauth/authorize?client_id=${clientId}&scope=&redirect_uri=${callback}`, windowName);
      window.addEventListener('message', onMessage);
    });
  }

  logOut()
  {
    this.token = null;
  }
}
