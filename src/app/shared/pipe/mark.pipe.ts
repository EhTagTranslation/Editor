import { Pipe, PipeTransform } from '@angular/core';
import * as escapeStringRegexp from 'escape-string-regexp';

const parser = new DOMParser();

function escapeHtml(unsafe: string) {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

@Pipe({
  name: 'mark',
  pure: true,
})
export class MarkPipe implements PipeTransform {
  transform(value: string, search: string, inputAsHtml?: boolean): string {
    if (!search) {
      return value;
    }
    const regexp = new RegExp(escapeStringRegexp(search), 'g');
    if (inputAsHtml) {
      const markNodes = (elem: Element) => {
        if (elem) {
          const nodes = elem.childNodes;
          for (let i = nodes.length; i--;) {
            const node = nodes[i];
            if (node.nodeType === 3) {
              // 文本节点
              const text = escapeHtml(node.textContent);
              const newText = text.replace(regexp, '<mark>$&</mark>');
              if (text !== newText) {
                const spanNode = document.createElement('span');
                spanNode.innerHTML = newText;
                node.parentElement.replaceChild(spanNode, node);
              }
            } else if (node.nodeType === 1) {
              // 元素节点
              markNodes(node as Element);
            }
          }
        }
      };
      const dom = parser.parseFromString(value, 'text/html') as HTMLDocument;
      const root = dom.body as Element;
      markNodes(root);
      return root.innerHTML;
    } else {
      return value.replace(regexp, '<mark>$&</mark>');
    }
  }
}
