import { parse, render } from '#shared/markdown';
import { Pipe, PipeTransform, SecurityContext } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
    name: 'markdown',
    pure: true,
})
export class MarkdownPipe implements PipeTransform {
    constructor(private readonly sanitizer: DomSanitizer) {}

    transform(value: string | null): SafeHtml {
        value ??= '';
        const ast = parse(value, undefined);
        const html = render(ast, 'html');
        return this.sanitizer.bypassSecurityTrustHtml(html);
    }
}
