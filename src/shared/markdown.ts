import * as MarkdownIt from 'markdown-it';
import { CellType, TagType, NamespaceName } from './interfaces/ehtag';
import { Database } from './database';
import { parseFragment, DefaultTreeNode, DefaultTreeElement, DefaultTreeTextNode, serialize } from 'parse5';
import { astTreeAdapter, DocumentFragment, htmlTreeAdapter, rawTreeAdapter, textTreeAdapter } from './tree-adapter';
import { Tree, Node, ContainerNode } from './interfaces/ehtag.ast';
import { URL } from 'url';

const opt = {
    html: false,
    breaks: true,
    linkify: true,
};

const md = MarkdownIt('commonmark', opt)
    .enable(['linkify'])
    .disable(['table', 'code', 'fence', 'blockquote', 'hr', 'list', 'reference', 'heading', 'lheading']);

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

function isTextNode(node: DefaultTreeNode): node is DefaultTreeTextNode {
    return node.nodeName === '#text';
}

const normalizer = {
    a(node: DefaultTreeElement, context) {
        const href = attr(node, 'href', (v) => (v ? normalizeLink(v).url : undefined));
        if (node.childNodes.length === 1) {
            const cNode = node.childNodes[0];
            if (isTextNode(cNode) && cNode.value === href) {
                try {
                    const hrefUrl = new URL(href);
                    const host = hrefUrl.host.toLowerCase();
                    for (const [k, v] of knownHosts) {
                        if (host.endsWith(k)) {
                            cNode.value = v;
                            break;
                        }
                    }
                } catch {
                    //
                }
            }
        }
    },
    img(node: DefaultTreeElement, context) {
        let src = attr(node, 'src');
        const title = attr(node, 'title');
        const alt = attr(node, 'alt');

        let nsfw: string | undefined = undefined;
        if (src && src.startsWith('#') && title) {
            // nsfw link
            nsfw = src;
            src = title;
        }

        const nlink = normalizeLink(src ?? '');
        src = nlink.url;
        if (!nsfw) nsfw = nlink.nsfw;
    },
} as Record<string, (<T extends Node>(node: T, context: Context) => void) | undefined> & ThisType<never>;

function normalize(node: Node, context: Context): void {
    const handler = normalizer[node.type];
    if (handler) handler(node, context);
    if ('contents' in node) {
        (node as ContainerNode).content.forEach((n) => normalize(n, context));
    }
}

export interface ParseResult {
    doc: DocumentFragment;
    context: Context;
}

export interface Context {
    database: Database;
    namespace: NamespaceName;
    raw: string;
}

export const parse = (src: string, context: Context, inline = false): ParseResult => {
    const env = {};
    const tokens = inline ? md.parseInline(src, env) : md.parse(src, env);
    const html = md.renderer.render(tokens, opt, env).trim();
    const doc = parseFragment(html, { treeAdapter: astTreeAdapter }) as DocumentFragment;
    doc.content.forEach((p) => normalize(p, context));
    return { doc, context };
};

export const render = <T extends TagType>(parsed: ParseResult, target: T): CellType<T> => {
    if (target === 'ast') return parsed.doc.content as CellType<T>;
    if (target === 'html') return serialize(parsed.doc, { treeAdapter: htmlTreeAdapter }) as CellType<T>;
    if (target === 'raw') return serialize(parsed.doc, { treeAdapter: rawTreeAdapter }) as CellType<T>;
    if (target === 'text') return serialize(parsed.doc, { treeAdapter: textTreeAdapter }) as CellType<T>;
    return {
        ast: render(parsed, 'ast'),
        html: render(parsed, 'html'),
        raw: render(parsed, 'raw'),
        text: render(parsed, 'text'),
    } as CellType<T>;
};
