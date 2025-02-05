import { Component, ElementRef, type OnInit, Renderer2 } from '@angular/core';
import { EhTagConnectorService } from '#browser/services/eh-tag-connector.service';
import { Location } from '@angular/common';
import { DbRepoService } from '#browser/services/db-repo.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    standalone: false,
})
export class AppComponent implements OnInit {
    constructor(
        private readonly ehTagConnector: EhTagConnectorService,
        private readonly location: Location,
        public readonly dbRepo: DbRepoService,
        private readonly el: ElementRef,
        private readonly renderer: Renderer2,
    ) {}
    ngOnInit(): void {
        this.ehTagConnector.updateHash().subscribe((_) => {
            //
        });
        window.addEventListener('resize', () => this.updateHeight(), { passive: true });
        this.updateHeight();
    }

    private updateHeight(): void {
        this.renderer.setStyle(this.el.nativeElement, 'height', `${window.innerHeight}px`);
    }

    goBack(): void {
        this.location.back();
    }
}
