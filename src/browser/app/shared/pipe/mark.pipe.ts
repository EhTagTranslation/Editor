import { Pipe, PipeTransform } from '@angular/core';
import { Location } from '@angular/common';
import escapeStringRegexp from 'escape-string-regexp';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { escapeHtml } from 'markdown-it/lib/common/utils';

const parser = new DOMParser();

interface NoSearchTerm {
    data: string;
    isRegex: undefined;
    regex?: undefined;
}

interface SearchTerm {
    data: string;
    isRegex: boolean;
    regex: RegExp;
    startRegex: RegExp;
    fullRegex: RegExp;
}

const noSearchTerm: NoSearchTerm = { data: '', isRegex: undefined };
let regexFromSearchCache: NoSearchTerm | SearchTerm = noSearchTerm;
export function regexFromSearch(search?: string | null): NoSearchTerm | SearchTerm {
    if (!search) {
        return noSearchTerm;
    }
    search = search.normalize();
    if (search === regexFromSearchCache.data) {
        return regexFromSearchCache;
    }
    if (search.startsWith('/') && search.endsWith('/') && search.length > 2) {
        try {
            const exp = search.substring(1, search.length - 1);
            const startExp = exp.startsWith('^') ? exp : '^' + exp;
            const fullExp = startExp.endsWith('$') ? startExp : startExp + '$';
            return (regexFromSearchCache = {
                data: search,
                isRegex: true,
                regex: new RegExp(exp, 'ig'),
                startRegex: new RegExp(startExp, 'ig'),
                fullRegex: new RegExp(fullExp, 'ig'),
            });
        } catch {
            //
        }
    }
    const escaped = escapeStringRegexp(search);
    return (regexFromSearchCache = {
        data: search,
        isRegex: false,
        regex: new RegExp(escaped, 'ig'),
        startRegex: new RegExp('^' + escaped, 'ig'),
        fullRegex: new RegExp('^' + escaped + '$', 'ig'),
    });
}

@Pipe({
    name: 'mark',
    pure: true,
})
export class MarkPipe implements PipeTransform {
    constructor(private readonly sanitizer: DomSanitizer, private readonly location: Location) {
        this.loadingImg = this.location.prepareExternalUrl('/assets/loading.gif');
    }

    private loadingImg: string;

    private markTextNode(node: Text, regexp: RegExp | undefined | null): void {
        // 文本节点
        const parent = node.parentElement;
        if (!parent) return;
        if (!regexp) return;
        const text = node.textContent ?? '';
        const normalText = text.split(regexp);
        if (normalText.length === 1) return;
        // eslint-disable-next-line @typescript-eslint/prefer-regexp-exec
        const markedText = text.match(regexp);
        if (!markedText) return;

        let html = '';
        for (let i = 0; i < normalText.length; i++) {
            html += escapeHtml(normalText[i]);
            if (markedText[i]) {
                html += `<mark>${escapeHtml(markedText[i])}</mark>`;
            }
        }
        const spanNode = document.createElement('span');
        spanNode.innerHTML = html;
        parent.replaceChild(spanNode, node);
    }

    private markElementNode(element: Element, regexp: RegExp | undefined | null): void {
        // 元素节点
        if (element.tagName === 'A') {
            element.setAttribute('ehlink', '');
            element.setAttribute('target', '_blank');
            if (!element.getAttribute('title')) {
                element.setAttribute('title', element.getAttribute('href') ?? '');
            }
        } else if (element.tagName === 'IMG') {
            element.setAttribute('referrerPolicy', 'no-referrer');
            element.setAttribute('ehimg', '');
            element.setAttribute('class', 'lazyload');
            if (!element.getAttribute('title')) {
                element.setAttribute('title', element.getAttribute('src') ?? '');
            }
            element.setAttribute('data-src', element.getAttribute('src') ?? '');
            element.setAttribute('src', this.loadingImg);
        }
        this.markNodes(element, regexp);
    }

    private markNodes(elem: Element | undefined | null, regexp: RegExp | undefined | null): void {
        if (!elem) return;

        const nodes = elem.childNodes;
        for (let i = nodes.length; i--; ) {
            const node = nodes[i];
            switch (node.nodeType) {
                case node.TEXT_NODE:
                    this.markTextNode(node as Text, regexp);
                    break;
                case node.ELEMENT_NODE:
                    this.markElementNode(node as Element, regexp);
                    break;
            }
        }
    }

    transform(value?: string | null, search?: string | null, inputAsHtml?: boolean | null): string | SafeHtml {
        if (!value) return value ?? '';
        if (!search && !inputAsHtml) {
            return value;
        }
        const regexp = search ? regexFromSearch(search).regex : undefined;
        if (inputAsHtml) {
            const dom = parser.parseFromString(value, 'text/html');
            const root = dom.body;
            this.markNodes(root, regexp);
            return this.sanitizer.bypassSecurityTrustHtml(root.innerHTML);
        } else {
            return regexp ? value.replace(regexp, '<mark>$&</mark>') : value;
        }
    }
}
