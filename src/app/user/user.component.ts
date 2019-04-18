import { Component, OnInit } from '@angular/core';
import { GithubOauthService } from 'src/services/github-oauth.service';
import { GithubUser } from 'src/interfaces/github';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.sass']
})
export class UserComponent implements OnInit {

  constructor(private github: GithubOauthService) { }

  user: GithubUser | null;

  loading = 0;

  private getUserInfo() {
    if (this.github.token) {
      this.loading++;
      this.github.getCurrentUser().subscribe(u => this.user = u, () => this.loading--, () => this.loading--);
    }
  }

  async ngOnInit() {
    this.getUserInfo();
  }

  async logIn() {
    this.loading++;
    this.github.logInIfNeeded().subscribe(login => {
      if (login) {
        this.getUserInfo();
      }
    }, () => this.loading--, () => this.loading--);
  }

  logOut() {
    this.github.logOut();
    this.user = null;
  }

  reviewSettings() {
    window.open(this.github.reviewUrl, '_blank');
  }
}
