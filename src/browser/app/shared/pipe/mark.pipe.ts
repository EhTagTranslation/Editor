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
}

let regexFromSearchCache: NoSearchTerm | SearchTerm = { data: '', isRegex: undefined };
export function regexFromSearch(search: string | null): NoSearchTerm | SearchTerm {
    if (!search) {
        return {
            data: search ?? '',
            isRegex: undefined,
        };
    }
    if (search === regexFromSearchCache.data) {
        return regexFromSearchCache;
    }
    if (search.startsWith('/') && search.endsWith('/') && search.length > 2) {
        try {
            const exp = search.substring(1, search.length - 1);
            const startExp = exp.startsWith('^') ? exp : '^' + exp;
            return (regexFromSearchCache = {
                data: search,
                isRegex: true,
                regex: new RegExp(exp, 'ig'),
                startRegex: new RegExp(startExp, 'ig'),
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

    transform(value: string | null, search: string, inputAsHtml?: boolean): string | SafeHtml {
        value = value ?? '';
        if (!search && !inputAsHtml) {
            return value;
        }
        const regexp = regexFromSearch(search).regex;
        if (inputAsHtml) {
            const markNodes = (elem: Element): void => {
                if (elem) {
                    const nodes = elem.childNodes;
                    for (let i = nodes.length; i--; ) {
                        const node = nodes[i];
                        if (node.nodeType === 3) {
                            // 文本节点
                            if (regexp) {
                                const text = escapeHtml(node.textContent ?? '');
                                const newText = text.replace(regexp, '<mark>$&</mark>');
                                if (text !== newText && node.parentElement) {
                                    const spanNode = document.createElement('span');
                                    spanNode.innerHTML = newText;
                                    node.parentElement.replaceChild(spanNode, node);
                                }
                            }
                        } else if (node.nodeType === 1) {
                            // 元素节点
                            const element = node as Element;
                            if (element.tagName === 'A') {
                                element.setAttribute('ehlink', '');
                                element.setAttribute('target', '_blank');
                                if (!element.getAttribute('title')) {
                                    element.setAttribute('title', element.getAttribute('href') ?? '');
                                }
                            }
                            if (element.tagName === 'IMG') {
                                element.setAttribute('referrerPolicy', 'no-referrer');
                                element.setAttribute('ehimg', '');
                                element.setAttribute('class', 'lazyload');
                                if (!element.getAttribute('title')) {
                                    element.setAttribute('title', element.getAttribute('src') ?? '');
                                }
                                element.setAttribute('data-src', element.getAttribute('src') ?? '');
                                element.setAttribute('src', this.loadingImg);
                            }
                            markNodes(element);
                        }
                    }
                }
            };
            const dom = parser.parseFromString(value, 'text/html') as HTMLDocument;
            const root = dom.body as Element;
            markNodes(root);
            return this.sanitizer.bypassSecurityTrustHtml(root.innerHTML);
        } else {
            return regexp ? value.replace(regexp, '<mark>$&</mark>') : value;
        }
    }
}
