import { Node, isNodeType, isContainer, Tree } from '../interfaces/ehtag.ast';

export function renderText(node: Node | Tree): string {
    if (Array.isArray(node)) return node.map(renderText).join('').trim();
    if (isNodeType(node, 'br')) return '\n';
    if (isNodeType(node, 'image')) return '';
    if (isNodeType(node, 'text')) return node.text;
    if (isNodeType(node, 'tagref')) {
        if (node.tag) return `${node.text}(${node.tag})`;
        else return node.text;
    }
    if (isContainer(node)) {
        const text = node.content.map(renderText).join('');
        if (node.type === 'paragraph') return text + '\n\n';
        return text;
    }
    return '';
}
