import { Component, OnInit } from '@angular/core';
import { EhTagConnectorService } from 'src/services/eh-tag-connector.service';
import { GithubReleaseService } from 'src/services/github-release.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass'],
})
export class AppComponent implements OnInit {
  constructor(
    private ehTagConnector: EhTagConnectorService,
  ) { }
  ngOnInit(): void {
    this.ehTagConnector.updateHash().subscribe(_ => { });
  }
}
