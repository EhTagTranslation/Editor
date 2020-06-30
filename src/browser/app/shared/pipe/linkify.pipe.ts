import { Pipe, PipeTransform, SecurityContext } from '@angular/core';
import { Location } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import * as LinkifyIt from 'linkify-it';
import { escapeHtml } from 'markdown-it/lib/common/utils';

@Pipe({
    name: 'linkify',
    pure: true,
})
export class LinkifyPipe implements PipeTransform {
    constructor(private readonly sanitizer: DomSanitizer, private readonly location: Location) {
        this.loadingimg = this.location.prepareExternalUrl('/assets/loading.gif');
    }
    private readonly linkify = LinkifyIt({});

    private loadingimg: string;

    transform(value: string | null): SafeHtml {
        value = this.sanitizer.sanitize(SecurityContext.HTML, value) ?? '';
        const matches = this.linkify.match(value);
        if (!matches) return this.sanitizer.bypassSecurityTrustHtml(value);
        value = matches.reduceRight(
            (str, match) =>
                `${str.slice(0, match.index)}<a href="${escapeHtml(match.url)}" target="_blank">${
                    match.text
                }</a>${str.slice(match.lastIndex)}`,
            value,
        );
        return this.sanitizer.bypassSecurityTrustHtml(value);
    }
}
