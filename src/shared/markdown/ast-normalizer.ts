import { Tree, LinkNode, ImageNode, Node, ContainerNode, isNodeType, NodeType, NodeMap } from '../interfaces/ehtag.ast';
import { remove } from 'lodash';
import { ParseResult, Context } from '.';
import { isRawTag } from '../validate';

function normalizeLink(
    url: string,
): {
    url: string;
    nsfw?: ImageNode['nsfw'];
} {
    const eh = /^(http|https):\/\/(?<domain>ehgt\.org(\/t|)|exhentai\.org\/t|ul\.ehgt\.org(\/t|))\/(?<tail>.+)$/.exec(
        url,
    );
    if (eh?.groups) {
        url = 'https://ehgt.org/' + eh.groups.tail;
        return { url, nsfw: eh.groups.domain.includes('exhentai') ? 'R18' : undefined };
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

function normalizeContainer(node: { content: Node[] }, context: Context): void {
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
    normalizeList(content, context);
    remove(content, (c) => isNodeType(c, 'text') && !c.text);
}

function normalizeList(nodes: readonly Node[], context: Context): void {
    nodes.forEach((n) => {
        const normalize = normalizer[n.type];
        normalize?.(n as never, context);
    });
}

const normalizer: { [T in NodeType]: undefined | ((node: NodeMap[T], context: Context) => void) } = {
    paragraph(node, context) {
        normalizeContainer(node, context);
    },
    text: undefined,
    br: undefined,
    tagref(node, context) {
        if (!context.normalized) return;
        if (node.tag != null) return;
        const tagDef = node.text.trim();
        const tag = tagDef.toLowerCase();
        if (!isRawTag(tag)) {
            console.warn(
                `Invalid tagref: '${tagDef}' of '${context.raw ?? ''}' in ${context.namespace.namespace} is not valid`,
            );
            node.tag = '';
            node.text = tagDef;
            return;
        }
        const record = context.namespace.get(tag) ?? context.database.get(tag);
        if (!record) {
            console.warn(
                `Invalid tagref: '${tagDef}' of '${context.raw ?? ''}' in ${context.namespace.namespace} is not found`,
            );
            node.tag = '';
            node.text = tagDef;
            return;
        }
        node.tag = tagDef;
        const nContext = {
            ...context,
            namespace: record.namespace,
            raw: tag,
        };
        node.text = record.name.render('text', nContext);
    },
    link(node, context) {
        normalizeContainer(node, context);

        const href = node.url;
        node.url = normalizeLink(href).url;
        if (node.content.length === 1) {
            const cNode = node.content[0];
            if (isNodeType(cNode, 'text') && cNode.text === href) {
                try {
                    const hrefUrl = new URL(href);
                    const host = hrefUrl.host.toLowerCase();
                    for (const [k, v] of knownHosts) {
                        if (host.endsWith(k)) {
                            cNode.text = v;
                            break;
                        }
                    }
                } catch {
                    //
                }
            }
        }
    },
    image(node, context) {
        normalizeContainer(node, context);

        const nlink = normalizeLink(node.url ?? '');
        node.url = nlink.url;
        if (!node.nsfw && nlink.nsfw) node.nsfw = nlink.nsfw;
    },
    emphasis(node, context) {
        normalizeContainer(node, context);
    },
    strong(node, context) {
        normalizeContainer(node, context);
    },
};

export function normalizeAst(parsed: ParseResult): void {
    normalizeContainer(parsed.doc, parsed.context);
}
