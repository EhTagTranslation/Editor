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

  async ngOnInit() {
    if (this.github.token) {
      this.user = await this.github.getCurrentUser();
    }
  }

  async logIn() {
    if (await this.github.logInIfNeeded()) {
      this.user = await this.github.getCurrentUser();
    }
  }

  logOut() {
    this.github.logOut();
    this.user = null;
  }

  reviewSettings() {
    window.open(this.github.reviewUrl, '_blank');
  }
}
