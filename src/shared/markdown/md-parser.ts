import * as MarkdownIt from 'markdown-it';

const opt = {
    html: false,
    breaks: true,
    linkify: true,
};

export const md = MarkdownIt('commonmark', opt)
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

export function parseMd(src: string): string {
    return md.render(src);
}
