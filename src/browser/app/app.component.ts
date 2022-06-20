import { Component, OnInit } from '@angular/core';
import { EhTagConnectorService } from '#browser/services/eh-tag-connector.service';
import { Location } from '@angular/common';
import { DbRepoService } from '#browser/services/db-repo.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
    constructor(
        private readonly ehTagConnector: EhTagConnectorService,
        private readonly location: Location,
        public readonly dbRepo: DbRepoService,
    ) {}
    ngOnInit(): void {
        this.ehTagConnector.updateHash().subscribe((_) => {
            //
        });
    }

    goBack(): void {
        this.location.back();
    }
}
