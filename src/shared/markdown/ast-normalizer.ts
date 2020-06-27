import { Tree, LinkNode, ImageNode, Node, ContainerNode, isNodeType, NodeType, NodeMap } from '../interfaces/ehtag.ast';
import { remove } from 'lodash';

function normalizeLink(
    url: string,
): {
    url: string;
    nsfw?: string;
} {
    const eh = /^(http|https):\/\/(?<domain>ehgt\.org(\/t|)|exhentai\.org\/t|ul\.ehgt\.org(\/t|))\/(?<tail>.+)$/.exec(
        url,
    );
    if (eh?.groups) {
        url = 'https://ehgt.org/' + eh.groups.tail;
        return { url, nsfw: eh.groups.domain.includes('exhentai') ? '#' : undefined };
    }
    const px = /^(http|https):\/\/i\.pximg\.net\/(?<tail>.+)$/.exec(url);
    if (px?.groups) {
        url = 'https://i.pixiv.cat/' + px.groups.tail;
        return { url };
    }
    return { url };
}

const knownHosts = new Map<string, string>([
    ['moegirl.org', '萌娘百科'],
    ['wikipedia.org', '维基百科'],
    ['pixiv.net', 'pixiv'],
    ['instagram.com', 'Instagram'],
    ['facebook.com', '脸书'],
    ['twitter.com', 'Twitter'],
    ['weibo.com', '微博'],
]);

// const normalizer = {
//     link(node: LinkNode, context) {
//         const href = attr(node, 'href', (v) => (v ? normalizeLink(v).url : undefined));
//         if (node.childNodes.length === 1) {
//             const cNode = node.childNodes[0];
//             if (isTextNode(cNode) && cNode.value === href) {
//                 try {
//                     const hrefUrl = new URL(href);
//                     const host = hrefUrl.host.toLowerCase();
//                     for (const [k, v] of knownHosts) {
//                         if (host.endsWith(k)) {
//                             cNode.value = v;
//                             break;
//                         }
//                     }
//                 } catch {
//                     //
//                 }
//             }
//         }
//     },
//     image(node: ImageNode, context) {
//         let src = attr(node, 'src');
//         const title = attr(node, 'title');
//         const alt = attr(node, 'alt');

//         let nsfw: string | undefined = undefined;
//         if (src && src.startsWith('#') && title) {
//             // nsfw link
//             nsfw = src;
//             src = title;
//         }

//         const nlink = normalizeLink(src ?? '');
//         src = nlink.url;
//         if (!nsfw) nsfw = nlink.nsfw;
//     },
// } as Record<string, (<T extends Node>(node: T, context: Context) => void) | undefined> & ThisType<never>;

// function normalize(node: Node, context: Context): void {
//     const handler = normalizer[node.type];
//     if (handler) handler(node, context);
//     if ('contents' in node) {
//         (node as ContainerNode).content.forEach((n) => normalize(n, context));
//     }
// }

function normalizeContainer(node: { content: Node[] }): void {
    const content = node.content;
    for (let i = 0; i < content.length; i++) {
        const current = content[i];
        if (isNodeType(current, 'br') || isNodeType(current, 'paragraph')) {
            const next = content[i + 1];
            if (isNodeType(next, 'text') && next.text.startsWith('\n')) {
                next.text = next.text.slice(1);
            }
            continue;
        }
        if (isNodeType(current, 'text')) {
            let text = current.text;
            let j = i + 1;
            for (; j < content.length; j++) {
                const next = content[j];
                if (!isNodeType(next, 'text')) break;
                text += next.text;
            }
            current.text = text;
            content.splice(i + 1, j - (i + 1));
        }
    }
    normalizeList(content);
    remove(content, (c) => isNodeType(c, 'text') && !c.text);
}

function normalizeList(nodes: readonly Node[]): void {
    nodes.forEach((n) => {
        const normalize = normalizer[n.type];
        normalize?.(n as never);
    });
}

const normalizer: { [T in NodeType]: undefined | ((node: NodeMap[T]) => void) } = {
    paragraph(node) {
        normalizeContainer(node);
    },
    text: undefined,
    br: undefined,
    tagref(node) {
        //
    },
    image(node) {
        normalizeContainer(node);
        //
    },
    link(node) {
        normalizeContainer(node);
        //
    },
    emphasis(node) {
        normalizeContainer(node);
    },
    strong(node) {
        normalizeContainer(node);
    },
};

export function normalizeAst(ast: Tree): void {
    normalizeContainer({ content: ast });
}
