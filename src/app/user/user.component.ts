import { Component, OnInit } from '@angular/core';
import { GithubOauthService } from 'src/services/github-oauth.service';
import { GithubUser } from 'src/interfaces/github';
import { GithubReleaseService } from 'src/services/github-release.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.sass']
})
export class UserComponent implements OnInit {

  constructor(
    private github: GithubOauthService,
    private release: GithubReleaseService,
  ) { }

  user: GithubUser | null;

  loading = 0;

  private getUserInfo() {
    if (this.github.token) {
      this.loading++;
      this.github.getCurrentUser()
        .pipe(finalize(() => this.loading--))
        .subscribe(u => this.user = u);
    }
  }

  async ngOnInit() {
    this.getUserInfo();
  }

  async logIn() {
    this.loading++;
    this.github.logInIfNeeded()
      .pipe(finalize(() => this.loading--))
      .subscribe(login => {
        if (login) {
          this.getUserInfo();
          this.release.refresh();
        }
      });
  }

  logOut() {
    this.github.logOut();
    this.user = null;
  }

  reviewSettings() {
    window.open(this.github.reviewUrl, '_blank');
  }
}
