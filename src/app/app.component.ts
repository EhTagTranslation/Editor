import { Component, OnInit } from '@angular/core';
import { EhTagConnectorService } from 'src/services/eh-tag-connector.service';
import { GithubReleaseService } from 'src/services/github-release.service';
import { RouteService } from 'src/services/route.service';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { DbRepoService } from 'src/services/db-repo.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.sass'],
})
export class AppComponent implements OnInit {
    constructor(
        private ehTagConnector: EhTagConnectorService,
        private router: Router,
        private location: Location,
        public dbRepo: DbRepoService,
    ) {}
    ngOnInit(): void {
        this.ehTagConnector.updateHash().subscribe((_) => {});
    }

    goBack() {
        this.location.back();
    }
}
