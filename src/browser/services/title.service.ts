import { Injectable } from '@angular/core';
import { Title } from '@angular/platform-browser';

@Injectable({
    providedIn: 'root',
})
export class TitleService {
    constructor(private readonly titleService: Title) {
        this.title = '';
    }
    private _title: string | undefined;
    get title(): string | undefined {
        return this._title;
    }
    set title(value: string | undefined) {
        value = (value ?? '').trim();
        if (value) {
            this.titleService.setTitle(value + ' - EhTag Editor');
        } else {
            this.titleService.setTitle('EhTag Editor');
        }
        this._title = value;
    }
}
