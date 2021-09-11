import { Injectable, isDevMode } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import type { GithubUser } from '../interfaces/github';
import { ApiEndpointService } from './api-endpoint.service';
import { Location } from '@angular/common';
import { of, from, throwError, Observable, lastValueFrom } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { LocalStorageService } from './local-storage.service';

const clientId = '2f2070671bda676ddb5a';
const windowName = 'githubOauth';
const TOKEN_KEY = 'github_oauth_token';

interface TokenData {
    token: string;
    error: unknown;
}

@Injectable({
    providedIn: 'root',
})
export class GithubOauthService {
    constructor(
        private readonly httpClient: HttpClient,
        private readonly location: Location,
        private readonly endpoints: ApiEndpointService,
        private readonly localStorage: LocalStorageService,
    ) {
        // make sure `token` is valid
        this.setToken(this.token ?? undefined);
        if (isDevMode()) {
            Object.defineProperty(globalThis, 'setToken', {
                value: (token: string) => this.setToken(token),
            });
        }
    }

    private readonly tokenStorage = this.localStorage.get(TOKEN_KEY);

    readonly tokenChange = this.tokenStorage.valueChange;
    get token(): string | undefined {
        return this.tokenStorage.value ?? undefined;
    }

    private setToken(value?: string): void {
        if (!value || !/^\w+$/.test(value)) {
            value = undefined;
        }
        this.tokenStorage.value = value ?? null;
    }

    /**
     * @see https://developer.github.com/v3/users/#get-the-authenticated-user
     */
    getCurrentUser(): Observable<GithubUser | undefined> {
        const token = this.token;
        if (!token) {
            return of(undefined);
        }
        return this.httpClient.get<GithubUser>(this.endpoints.github('user')).pipe(
            catchError((error: HttpErrorResponse) => {
                if (error.status === 401 && this.token === token) {
                    // token is invalid.
                    this.setToken();
                }
                return of(undefined);
            }),
        );
    }
    /**
     * @returns `true` for succeed login, `false` if has been logged in.
     */
    logInIfNeeded(): Observable<boolean> {
        if (this.token) {
            return of(false);
        }
        const myState = Math.random().toString();
        const callback = new URL(this.location.prepareExternalUrl('/assets/callback.html'), window.location.href);
        const redirectUri = encodeURIComponent(callback.href);
        const authWindow = window.open(
            `https://github.com/login/oauth/authorize?client_id=${clientId}&scope=&state=${myState}&redirect_uri=${redirectUri}`,
            windowName,
            'toolbar=no,location=no,status=no,menubar=no,scrollbars=no,resizable=no,width=640,height=720',
        );
        if (!authWindow) {
            return throwError(() => new Error('Failed to open new window.'));
        }

        const authChecker = new Promise<void>((res) => {
            const authTick = setInterval(() => {
                if (authWindow.closed) {
                    clearInterval(authTick);
                    res();
                }
            }, 500);
        });

        const promise = new Promise<Record<string, string>>((res, rej) => {
            const onMessage = (ev: MessageEvent): void => {
                if (ev.source !== authWindow) {
                    return;
                }
                res(ev.data as Record<string, string>);
                window.removeEventListener('message', onMessage);
            };
            void authChecker.then(() => {
                window.removeEventListener('message', onMessage);
                rej(new Error('Auth window closed.'));
            });
            window.addEventListener('message', onMessage);
        })
            .then(({ code, state }) => {
                if (state !== myState) throw new Error('Wrong state');
                return lastValueFrom(
                    this.httpClient.get<TokenData>(`https://ehtt.herokuapp.com/auth/${code}?state=${state}`),
                );
            })
            .catch((error: unknown) => ({ token: null, error }))
            .then((token) => {
                if (!token.token || token.error) {
                    throw token.error || token;
                }
                this.setToken(token.token);
                return true;
            });
        return from(promise);
    }

    logOut(): void {
        this.setToken();
    }

    /**
     * Directing users to review their access
     * @see https://developer.github.com/apps/building-oauth-apps/authorizing-oauth-apps/#directing-users-to-review-their-access
     */
    get reviewUrl(): string {
        return `https://github.com/settings/connections/applications/${clientId}`;
    }
}
