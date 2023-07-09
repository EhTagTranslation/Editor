import { parse, render } from '#shared/markdown';
import { Pipe, type PipeTransform } from '@angular/core';

@Pipe({
    name: 'markdown',
    pure: true,
})
export class MarkdownPipe implements PipeTransform {
    transform(value: string | null): string {
        value ??= '';
        const ast = parse(value, undefined);
        const html = render(ast, 'html');
        return html;
    }
}
