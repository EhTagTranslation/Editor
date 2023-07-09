import { Component, type OnInit } from '@angular/core';
import { GithubOauthService } from '#browser/services/github-oauth.service';
import type { GithubUser } from '#browser/interfaces/github';
import { GithubReleaseService } from '#browser/services/github-release.service';
import { finalize } from 'rxjs/operators';

@Component({
    selector: 'app-user',
    templateUrl: './user.component.html',
    styleUrls: ['./user.component.scss'],
})
export class UserComponent implements OnInit {
    constructor(
        private readonly github: GithubOauthService,
        private readonly release: GithubReleaseService,
    ) {}

    user?: GithubUser;

    loading = 0;

    private getUserInfo(): void {
        if (this.github.token) {
            this.loading++;
            this.github
                .getCurrentUser()
                .pipe(finalize(() => this.loading--))
                .subscribe((u) => (this.user = u));
        }
    }

    ngOnInit(): void {
        this.getUserInfo();
    }

    logIn(): void {
        this.loading++;
        this.github
            .logInIfNeeded()
            .pipe(finalize(() => this.loading--))
            .subscribe((login) => {
                if (login) {
                    this.getUserInfo();
                    this.release.refresh();
                }
            });
    }

    logOut(): void {
        this.github.logOut();
        this.user = undefined;
    }

    reviewSettings(): void {
        window.open(this.github.reviewUrl, '_blank');
    }
}
