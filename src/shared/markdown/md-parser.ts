import MarkdownIt from 'markdown-it';
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
} from '../interfaces/ehtag.ast';
import Token from 'markdown-it/lib/token';
import { Context } from './context';
import { isRawTag } from '../validate';

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

function normalizeUrl(
    url: string,
): {
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
        url = 'https://ehgt.org/' + eh.groups.tail;
        return { url, nsfw: eh.groups.domain.includes('exhentai') ? 'R18' : undefined };
    }

    // pixiv 图片使用反代
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
function normalizeLink(node: LinkNode): void {
    const href = node.url;
    const url = normalizeUrl(href).url;
    node.url = url;
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
            } catch (ex) {
                console.log(ex);
            }
        }
    }
}

function normalizeImage(node: ImageNode): void {
    let src = node.url;
    let title = node.title;
    let nsfw: ImageNode['nsfw'] = node.nsfw;
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

function normalizeTagref(node: TagRefNode, context: Context): void {
    const tagDef = node.text.trim();
    const tag = tagDef.toLowerCase();
    if (!isRawTag(tag)) {
        context.warn(`无效标签引用：\`${node.text}\` 不是一个有效的标签。`);
        node.tag = '';
        node.text = tagDef;
        return;
    }
    const record = context.namespace.get(tag) ?? context.database.get(tag);
    if (!record) {
        context.warn(`无效标签引用：\`${node.text}\` 在数据库中不存在。`);
        node.tag = '';
        node.text = tagDef;
        return;
    }
    node.tag = tagDef;
    const nContext = new Context(record, tag, context.logger);
    node.text = record.name.render('text', nContext);
}

class AstBuilder {
    constructor(readonly src: string, readonly context: Context) {
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
        if (token.type === 'text') {
            parent.content.push({
                type: 'text',
                text: token.content,
            } as TextNode);
        } else if (token.type === 'code_inline') {
            const tag: TagRefNode = {
                type: 'tagref',
                text: token.content,
            };
            normalizeTagref(tag, this.context);
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

export function parseMd(src: string, context: Context): Tree {
    const builder = new AstBuilder(src, context);
    return builder.result;
}
