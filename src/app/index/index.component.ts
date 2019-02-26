import { Component } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { GithubOauthService } from 'src/service/github-oauth.service';
import { EhTagConnectorService } from 'src/service/eh-tag-connector.service';

@Component({
  selector: 'app-index',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.css']
})
export class IndexComponent {

  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches)
    );

  namespace = [
    { key: 'artist', name: '作者' },
    { key: 'character', name: '角色' },
    { key: 'group', name: '团队' },
    { key: 'language', name: '语言' },
    { key: 'female', name: '女性' },
    { key: 'male', name: '男性' },
    { key: 'parody', name: '原著' },
    { key: 'reclass', name: '重分类' },
  ];

  constructor(
    private breakpointObserver: BreakpointObserver,
    private githubOauth: GithubOauthService,
    private ehTagConnector: EhTagConnectorService,
  ) {
    this.githubOauth.logInIfNeeded();
    this.githubOauth.getCurrentUser().then(e => console.log(e));
    this.ehTagConnector.getTag({
      namespace: 'parody',
      raw: '	.hack',
    }).finally(() =>
      this.ehTagConnector.deleteTag({
        namespace: 'parody',
        raw: '	.ha1sdafck',
      })
    );
  }

}
