import { tagAbbrFull } from '../tag.js';
import type { Node, Tree, NodeType, NodeMap, ContainerNode } from '../interfaces/ehtag.ast.js';

function encodeUrl(url: string): string {
    return url;
}

function encodeHtml(value: string): string {
    return value;
}

const renderers: { [T in NodeType]: (node: NodeMap[T], parent?: ContainerNode, index?: number) => string } = {
    paragraph(node) {
        return renderContainer(node) + '\n\n';
    },
    text(node, parent, index) {
        let escaped = node.text.replace(/([_*`])/gi, '\\$1');
        if (
            escaped.endsWith('!') &&
            parent &&
            index != null &&
            parent.content[index + 1]?.type === 'link'
        ) {
            escaped = escaped.slice(0, escaped.length - 1) + '\\!';
        }
        return escaped;
    },
    br() {
        return '\n';
    },
    tagref(node) {
        let ref;
        if (!node.tag) {
            ref = node.text;
        } else if (node.ns == null || !node.explicitNs) {
            ref = node.tag;
        } else {
            ref = tagAbbrFull(node.tag, node.ns);
        }
        let backtick = '`';
        while (ref.includes(backtick)) {
            backtick += '`';
        }
        if (backtick.length > 1) {
            if (ref.startsWith('`')) ref = ' ' + ref;
            if (ref.endsWith('`')) ref = ref + ' ';
        }
        return backtick + ref + backtick;
    },
    image(node) {
        const content = renderContainer(node);
        if (node.nsfw) {
            const url = node.nsfw === 'R18' ? '#' : '##';
            return `![${content}](${url} "${encodeUrl(node.url)}")`;
        } else if (node.title) {
            return `![${content}](${encodeUrl(node.url)} "${encodeHtml(node.title)}")`;
        } else {
            return `![${content}](${encodeUrl(node.url)})`;
        }
    },
    link(node) {
        const content = renderContainer(node);
        if (node.title) {
            return `[${content}](${encodeUrl(node.url)} "${encodeHtml(node.title)}")`;
        } else {
            return `[${content}](${encodeUrl(node.url)})`;
        }
    },
    emphasis(node) {
        const content = renderContainer(node);
        return `*${content}*`;
    },
    strong(node) {
        const content = renderContainer(node);
        return `**${content}**`;
    },
};

function renderNode(node: Node, parent?: ContainerNode, index?: number): string {
    const renderer = renderers[node.type];
    if (renderer) return renderer(node as never, parent, index);
    return '';
}

function renderContainer(nodes: ContainerNode): string {
    if (!nodes.content) return '';
    return nodes.content.map((n, i) => renderNode(n, nodes, i)).join('');
}

export function renderMd(node: Node | Tree): string {
    if (Array.isArray(node)) {
        return node
            .map((n) => renderNode(n))
            .join('')
            .trim();
    }
    return renderNode(node);
}
