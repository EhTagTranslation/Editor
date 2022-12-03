import MarkdownIt from 'markdown-it';
import type Token from 'markdown-it/lib/token.js';
import type { FixedLengthArray } from 'type-fest';
import { Context } from './context.js';
import type { NamespaceName } from '../interfaces/ehtag.js';
import {
    Tree,
    ParaNode,
    ContainerNode,
    TextNode,
    TagRefNode,
    BreakNode,
    ImageNode,
    LinkNode,
    isNodeType,
    EmphasisNode,
    StrongNode,
} from '../interfaces/ehtag.ast.js';
import { parseTag } from '../tag.js';

const md = MarkdownIt('commonmark', {
    html: false,
    breaks: true,
    linkify: true,
})
    .enable(['linkify'])
    .disable(['table', 'code', 'fence', 'blockquote', 'hr', 'list', 'reference', 'heading', 'lheading']);

md.linkify.set({
    fuzzyEmail: false,
    fuzzyIP: false,
    fuzzyLink: false,
});

const normalizeLinkText = md.normalizeLinkText.bind(md);
//const normalizeLink = md.normalizeLink.bind(md);

md.normalizeLink = md.normalizeLinkText = (url) => {
    url = normalizeLinkText(url);
    url = url.replace(/[[\]()'"`{}<>\s]/gi, (c) => {
        const code = c.charCodeAt(0);
        if (code < 0x80) return '%' + code.toString(16);
        return c;
    });
    return url;
};

function normalizeUrl(url: string): {
    url: string;
    nsfw?: ImageNode['nsfw'];
} {
    url = md.normalizeLink(url);
    // ehgt 图片使用 https://ehgt.org/ 域名，国内速度较快，且不需要里站 cookie
    // Eg: https://ehgt.org/t/52/b4/52b4fd923618bd7ec49eb3ccbae43c979e769110-1060746-1280-1024-jpg_300.jpg
    //            https://ehgt.org               /52 /b4 /52b4fd923618bd7ec49eb3ccbae43c979e769110-1060746-1280-1024-jpg _       300        .jpg
    // http(s)://((ul.)ehgt.org(/t)|exhentai.org)|0-1|2-3|              完整哈希                  |size(B)| w  | h  |类型|    l/250/300     |jpg
    //                                           |            原始图片信息哈希（sha1）            |    原始图片信息      |后两者只有封面图有|固定
    const eh = /^(http|https):\/\/(?<domain>ehgt\.org(\/t|)|exhentai\.org\/t|ul\.ehgt\.org(\/t|))\/(?<tail>.+)$/.exec(
        url,
    );
    if (eh?.groups) {
        url = 'https://ehgt.org/' + eh.groups['tail'];
        return { url, nsfw: eh.groups['domain'].includes('exhentai') ? 'R18' : undefined };
    }

    // pixiv 图片使用反代
    const px = /^(http|https):\/\/i\.pximg\.net\/(?<tail>.+)$/.exec(url);
    if (px?.groups) {
        url = 'https://i.pixiv.cat/' + px.groups['tail'];
        return { url };
    }
    return { url };
}

const knownHosts = new Map<string, string>([
    ['moegirl.org', '萌娘百科'],
    ['moegirl.org.cn', '萌娘百科'],
    ['zh.wikipedia.org', '维基百科'],
    ['ja.wikipedia.org', '维基百科（日语）'],
    ['en.wikipedia.org', '维基百科（英语）'],
    ['pixiv.net', 'pixiv'],
    ['instagram.com', 'Instagram'],
    ['facebook.com', '脸书'],
    ['twitter.com', 'Twitter'],
    ['weibo.com', '微博'],
    ['bgm.tv', 'Bangumi'],
    ['fandom.com', 'Fandom'],
    ['bilibili.com', '哔哩哔哩'],
    ['skeb.jp', 'Skeb'],
    ['fanbox.cc', 'FANBOX'],
    ['patreon.com', 'Patreon'],
    ['fantia.jp', 'Fantia'],
    ['afdian.net', '爱发电'],
]);

const knownImageExtensions = new Set<string>(['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg']);

function normalizeLink(node: LinkNode): void {
    // 规格化 URL
    const href = node.url;
    const { url, nsfw } = normalizeUrl(href);
    node.url = url;

    // 不进一步处理复杂内容节点
    if (node.content.length !== 1) return;
    const contentNode = node.content[0];
    if (!isNodeType(contentNode, 'text') || contentNode.text !== href) return;

    try {
        const hrefUrl = new URL(href);
        // 检查是否为图片
        const pathname = hrefUrl.pathname.toLowerCase();
        for (const k of knownImageExtensions) {
            if (pathname.endsWith(k)) {
                const imgNode = node as LinkNode | ImageNode as ImageNode;
                imgNode.type = 'image';
                imgNode.content = [];
                imgNode.nsfw = nsfw ?? false;
                normalizeImage(imgNode);
                break;
            }
        }
        // 检查是否为已知域名
        const host = hrefUrl.host.toLowerCase();
        for (const [k, v] of knownHosts) {
            if (host === k || (host.endsWith(k) && host[host.length - k.length - 1] === '.')) {
                contentNode.text = v;
                break;
            }
        }
    } catch (ex) {
        console.log(ex);
    }
}

function normalizeImage(node: ImageNode): void {
    let src = node.url;
    let title = node.title;
    let nsfw = node.nsfw;
    if (src.startsWith('#') && /^https?:\/\/[^/]+/.test(title)) {
        if (src === '#') {
            src = title;
            title = '';
            nsfw = 'R18';
        } else if (src === '##') {
            src = title;
            title = '';
            nsfw = 'R18G';
        }
    }
    const norm = normalizeUrl(src);
    if (nsfw === false && norm.nsfw) nsfw = norm.nsfw;
    node.url = norm.url;
    node.title = title;
    node.nsfw = nsfw;
}

const SEARCH_ORDER: Record<NamespaceName, Readonly<FixedLengthArray<NamespaceName, 12>>> = {
    rows: [
        'rows',
        'reclass',
        'female',
        'mixed',
        'male',
        'other',
        'language',
        'parody',
        'character',
        'group',
        'artist',
        'cosplayer',
    ],
    reclass: [
        'reclass',
        'female',
        'mixed',
        'male',
        'other',
        'language',
        'group',
        'artist',
        'cosplayer',
        'parody',
        'character',
        'rows',
    ],
    language: [
        'language',
        'other',
        'group',
        'artist',
        'cosplayer',
        'parody',
        'character',
        'female',
        'mixed',
        'male',
        'reclass',
        'rows',
    ],
    other: [
        'other',
        'language',
        'female',
        'mixed',
        'male',
        'reclass',
        'group',
        'artist',
        'cosplayer',
        'parody',
        'character',
        'rows',
    ],
    parody: [
        'parody',
        'character',
        'group',
        'artist',
        'cosplayer',
        'other',
        'language',
        'female',
        'mixed',
        'male',
        'reclass',
        'rows',
    ],
    character: [
        'character',
        'parody',
        'group',
        'artist',
        'cosplayer',
        'other',
        'language',
        'female',
        'mixed',
        'male',
        'reclass',
        'rows',
    ],
    group: [
        'group',
        'artist',
        'cosplayer',
        'parody',
        'character',
        'other',
        'language',
        'female',
        'mixed',
        'male',
        'reclass',
        'rows',
    ],
    artist: [
        'artist',
        'group',
        'cosplayer',
        'parody',
        'character',
        'other',
        'language',
        'female',
        'mixed',
        'male',
        'reclass',
        'rows',
    ],
    cosplayer: [
        'cosplayer',
        'group',
        'artist',
        'parody',
        'character',
        'other',
        'language',
        'female',
        'mixed',
        'male',
        'reclass',
        'rows',
    ],
    male: [
        'male',
        'mixed',
        'female',
        'other',
        'language',
        'reclass',
        'group',
        'artist',
        'cosplayer',
        'parody',
        'character',
        'rows',
    ],
    female: [
        'female',
        'mixed',
        'male',
        'other',
        'language',
        'reclass',
        'group',
        'artist',
        'cosplayer',
        'parody',
        'character',
        'rows',
    ],
    mixed: [
        'mixed',
        'female',
        'male',
        'other',
        'language',
        'reclass',
        'group',
        'artist',
        'cosplayer',
        'parody',
        'character',
        'rows',
    ],
};

function normalizeTagRef(node: TagRefNode, context: Context): void {
    const text = (node.text ?? '').trim();
    const tag = parseTag(text);

    if (!tag.valid) {
        context.warn(`无效标签引用：\`${text}\` 不是一个有效的标签。`);
        node.tag = '';
        node.text = text;
        return;
    }

    let record;
    const explicitNs = tag.ns != null;
    if (tag.ns) {
        // 标签信息包含命名空间
        record = context.database.data[tag.ns].get(tag.raw);
    } else {
        // 按指定顺序查找
        for (const ns of SEARCH_ORDER[context.namespace.name]) {
            record = context.database.data[ns].get(tag.raw);
            if (record) {
                tag.ns = ns;
                break;
            }
        }
    }
    if (!record) {
        context.warn(`无效标签引用：\`${node.text}\` 在数据库中不存在。`);
        node.tag = '';
        node.text = text;
        return;
    }

    node.tag = tag.raw;
    node.ns = tag.ns;
    if (explicitNs) {
        node.explicitNs = true;
    } else {
        node.explicitNs = undefined;
    }
    const nContext = new Context(record, tag.raw, context.logger);
    node.text = record.name.render('text', nContext);
}

class AstBuilder {
    constructor(readonly src: string, readonly context: Context | undefined) {
        this.build();
    }

    readonly result: Tree = [];

    private expectEnd(token: Token): never {
        throw new Error(`Unexpected token type=${token.type} tag=${token.tag}, expected end of sequence`);
    }
    private unknownToken(token: Token): never {
        throw new Error(`Unknown token type=${token.type} tag=${token.tag}`);
    }
    private expectToken(token: Token, expectedType: string): void {
        if (token.type !== expectedType) {
            throw new Error(`Unexpected token type=${token.type} tag=${token.tag}, expected type=${expectedType}`);
        }
    }

    private build(): void {
        const tokens = md.parse(this.src, {});
        for (let index = 0; index < tokens.length; ) {
            const element = tokens[index];
            switch (element.type) {
                case 'paragraph_open': {
                    index = this.buildParagraph(tokens, index);
                    break;
                }
                default: {
                    this.expectEnd(element);
                }
            }
        }
    }

    private buildParagraph(tokens: Token[], start: number): number {
        const para: ParaNode = {
            type: 'paragraph',
            content: [],
        };
        this.expectToken(tokens[start], 'paragraph_open');
        start++;
        while (start < tokens.length) {
            const current = tokens[start];
            switch (current.type) {
                case 'inline': {
                    this.buildInline(current, para);
                    start++;
                    break;
                }
                case 'paragraph_close': {
                    this.result.push(para);
                    start++;
                    return start;
                }
                default:
                    this.expectEnd(current);
            }
        }
        throw new Error('No paragraph_close token');
    }

    private buildInline(token: Token, parent: ContainerNode): void {
        if (!token.children) throw new Error('Invalid inline token');
        if (token.children.length === 0) return;
        const end = this.buildInlineTokens(token.children, 0, parent, 0);
        if (token.children.length !== end) {
            this.expectEnd(token.children[end]);
        }
    }

    private buildInlineTokens(tokens: Token[], start: number, parent: ContainerNode, level: number): number {
        while (start < tokens.length && tokens[start].level >= level) {
            const content = tokens[start];
            switch (content.type) {
                case 'link_open': {
                    const link: LinkNode = {
                        type: 'link',
                        url: content.attrGet('href') ?? '',
                        title: content.attrGet('title') ?? '',
                        content: [],
                    };
                    start = this.buildInlineTokens(tokens, start + 1, link, content.level + 1);
                    this.expectToken(tokens[start], 'link_close');
                    normalizeLink(link);
                    start++;
                    parent.content.push(link);
                    break;
                }
                case 'em_open': {
                    const em: EmphasisNode = {
                        type: 'emphasis',
                        content: [],
                    };
                    start = this.buildInlineTokens(tokens, start + 1, em, content.level + 1);
                    this.expectToken(tokens[start], 'em_close');
                    start++;
                    parent.content.push(em);
                    break;
                }
                case 'strong_open': {
                    const strong: StrongNode = {
                        type: 'strong',
                        content: [],
                    };
                    start = this.buildInlineTokens(tokens, start + 1, strong, content.level + 1);
                    this.expectToken(tokens[start], 'strong_close');
                    start++;
                    parent.content.push(strong);
                    break;
                }
                default: {
                    this.buildInlineToken(content, parent);
                    start++;
                    break;
                }
            }
        }
        return start;
    }

    private buildInlineToken(token: Token, parent: ContainerNode): void {
        if (token.type === 'text' || token.type === 'text_special') {
            parent.content.push({
                type: 'text',
                text: token.content,
            } as TextNode);
        } else if (token.type === 'code_inline') {
            const tag: TagRefNode = {
                type: 'tagref',
                text: token.content,
            };
            if (this.context) {
                normalizeTagRef(tag, this.context);
            }
            parent.content.push(tag);
        } else if (token.type === 'softbreak' || token.type === 'hardbreak') {
            parent.content.push({
                type: 'br',
            } as BreakNode);
        } else if (token.type === 'image') {
            const node: ImageNode = {
                type: 'image',
                content: [],
                url: token.attrGet('src') ?? '',
                title: token.attrGet('title') ?? '',
                nsfw: false,
            };
            this.buildInline(token, node);
            normalizeImage(node);
            parent.content.push(node);
        } else {
            this.unknownToken(token);
        }
    }
}

export function parseMd(src: string, context: Context | undefined): Tree {
    const builder = new AstBuilder(src, context);
    return builder.result;
}
