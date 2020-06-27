import { Node, Tree, NodeType, NodeMap } from '../interfaces/ehtag.ast';

function encodeUrl(url: string): string {
    return url;
}

function encodeHtml(value: string): string {
    return value;
}

const renderers: { [T in NodeType]: (node: NodeMap[T]) => string } = {
    paragraph(node) {
        return renderList(node.content) + '\n\n';
    },
    text(node) {
        return node.text.replace(/([_*])/gi, '\\$1');
    },
    br() {
        return '\n';
    },
    tagref(node) {
        let ref = node.tag ? node.tag : node.text;
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
        const content = renderList(node.content);
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
        const content = renderList(node.content);
        if (node.title) {
            return `[${content}](${encodeUrl(node.url)} "${encodeHtml(node.title)}")`;
        } else {
            return `[${content}](${encodeUrl(node.url)})`;
        }
    },
    emphasis(node) {
        const content = renderList(node.content);
        return `*${content}*`;
    },
    strong(node) {
        const content = renderList(node.content);
        return `**${content}**`;
    },
};

function renderList(nodes: readonly Node[]): string {
    return nodes.map(renderMd).join('');
}

export function renderMd(node: Node | Tree): string {
    if (Array.isArray(node)) return renderList(node).trim();
    const renderer = renderers[node.type];
    if (renderer) return renderer(node as never);
    return '';
}
