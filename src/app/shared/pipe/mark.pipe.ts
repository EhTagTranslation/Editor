import { Pipe, PipeTransform } from '@angular/core';
import * as escapeStringRegexp from 'escape-string-regexp';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

const parser = new DOMParser();

function escapeHtml(unsafe: string | null) {
  if (!unsafe) {
    return '';
  }
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function regexFromSearch(search: string | null) {
  if (!search) {
    return null;
  }
  if (search.startsWith('/') && search.endsWith('/') && search.length > 2) {
    try {
      return new RegExp(search.substring(1, search.length - 1), 'g');
    } catch {
      return new RegExp(escapeStringRegexp(search), 'g');
    }
  }
  return new RegExp(escapeStringRegexp(search), 'g');
}

@Pipe({
  name: 'mark',
  pure: true,
})
export class MarkPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) { }

  transform(value: string, search: string, inputAsHtml?: boolean): string | SafeHtml {
    if (!search && !inputAsHtml) {
      return value;
    }
    const regexp = regexFromSearch(search);
    if (inputAsHtml) {
      const markNodes = (elem: Element) => {
        if (elem) {
          const nodes = elem.childNodes;
          for (let i = nodes.length; i--;) {
            const node = nodes[i];
            if (node.nodeType === 3) {
              // 文本节点
              if (regexp) {
                const text = escapeHtml(node.textContent);
                const newText = text.replace(regexp, '<mark>$&</mark>');
                if (text !== newText && node.parentElement) {
                  const spanNode = document.createElement('span');
                  spanNode.innerHTML = newText;
                  node.parentElement.replaceChild(spanNode, node);
                }
              }
            } else if (node.nodeType === 1) {
              // 元素节点
              const enode = node as Element;
              if (enode.tagName === 'A') {
                enode.setAttribute('target', '_blank');
                if (!enode.getAttribute('title')) {
                  enode.setAttribute('title', enode.getAttribute('href') || '');
                }
              }
              if (enode.tagName === 'IMG') {
                if (!enode.getAttribute('title')) {
                  enode.setAttribute('title', enode.getAttribute('src') || '');
                }
              }
              markNodes(enode);
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
