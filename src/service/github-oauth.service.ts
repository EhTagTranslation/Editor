import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

const clientId = '2f2070671bda676ddb5a';
const clientSecret = '98e1de649c67ac4a9985586d5d14dbe12092e244';
const windowName = 'githubOauth';

@Injectable({
  providedIn: 'root'
})
export class GithubOauthService
{

  constructor(
    private httpClient: HttpClient,
  )
  {
  }

  onMessage = async (ev: MessageEvent) =>
  {
    console.log(ev.data);
    const code = ev.data.code as string;
    if (!code)
    {
      return;
    }
    this.httpClient.post(`https://github.com/login/oauth/access_token`, { client_id: clientId, client_secret: clientSecret, code }).subscribe(v => console.log(v));
  }

  startAuth()
  {
    console.log('auth');
    const callback = location.origin + location.pathname + 'assets/callback.html';
    window.open(`https://github.com/login/oauth/authorize?client_id=${clientId}&scope=&redirect_uri=${callback}`, windowName);
    window.addEventListener('message', this.onMessage);
  }
}
