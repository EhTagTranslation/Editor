import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-github-corner',
    templateUrl: './github-corner.component.html',
    styleUrls: ['./github-corner.component.scss'],
})
export class GithubCornerComponent {
    @Input() href!: string;
    @Input() target!: string;
    hover = false;

    open(): void {
        window.open(this.href, this.target);
    }
}
