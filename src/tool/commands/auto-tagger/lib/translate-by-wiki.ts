import { request } from '../../../../shared/ehentai/http';
import type { MediaType } from './search-eh-wiki';

export const WIKI_LANG = {
    zh: '中文',
    en: '英语',
    ja: '日语',
};

export type WikiLang = keyof typeof WIKI_LANG;

async function wikiApi<T>(
    url: string,
    query: {
        action: string;
        [key: string]: string | string[];
    },
): Promise<T> {
    const search = new URLSearchParams('format=json&formatversion=2');
    for (const key in query) {
        const value = query[key];
        if (Array.isArray(value)) {
            value.forEach((v) => search.append(key, v));
        } else {
            search.set(key, value);
        }
    }
    return (
        await request<{ [K: string]: T }>({
            method: 'GET',
            url: url,
            params: search,
            headers: { 'accept-language': 'zh-CN,zh;q=0.9' },
        })
    ).data[query.action];
}

function pickDisambiguation(
    title: string,
    candidates: string[],
    mediaTypes: MediaType[],
    lang: WikiLang,
): string | undefined {
    const disambiguationHint = {
        ja: {
            'video game': 'ゲーム',
            'anime/manga': 'アニメ',
            movie: '映画',
            novel: '小説',
        },
        en: {
            'video game': 'video game',
            'anime/manga': 'anime',
            movie: 'movie',
            novel: 'novel',
        },
        zh: {
            'video game': '电视游戏',
            'anime/manga': '动漫',
            movie: '电影',
            novel: '小说',
        },
    }[lang];
    const mt = mediaTypes.map((m) => `(${disambiguationHint[m]})`);
    const filtered = candidates.filter((c) => mt.some((m) => c.includes(m)));
    console.log(mt, filtered);
    if (filtered.length > 0) {
        console.log(`选中“${filtered[0]}”搜索， 其他候选`, filtered.slice(1));
        return filtered[0];
    }
    return undefined;
}

async function langlinks(
    title: string,
    mediaTypes: MediaType[],
    from: WikiLang,
    to: WikiLang,
): Promise<
    | {
          redirected: string;
          translated?: string;
      }
    | undefined
> {
    const res = await wikiApi<{
        pages: Array<{
            pageid: number;
            title: string;
            langlinks: Array<{
                lang: WikiLang;
                title: string;
            }>;
            categories: Array<{ ns: number; title: string }>;
        }>;
        redirects: Array<{ from: string; to: string }>;
    }>(`https://${from}.wikipedia.org/w/api.php`, {
        action: 'query',
        prop: 'langlinks|categories',
        redirects: '',
        titles: title,
        lllang: to,
        pllimit: '100',
    });
    if (res.redirects?.[0]?.from === title) {
        console.log(`${WIKI_LANG[from]}维基条目“${title}”重定向到“${res.redirects[0].to}”`);
        title = res.redirects[0].to;
    }
    const pageInfo = res.pages?.[0];
    if (!pageInfo?.pageid) {
        console.log(`未找到${WIKI_LANG[from]}维基条目“${title}”`);
        return undefined;
    }
    const isDisambiguation = pageInfo.categories?.some(
        (c) =>
            c.ns === 14 &&
            ['Category:All disambiguation pages', 'Category:全部消歧義頁面', 'Category:すべての曖昧さ回避'].includes(
                c.title,
            ),
    );
    if (isDisambiguation) {
        const res = await wikiApi<{
            pages: Array<{
                pageid: number;
                title: string;
                links: Array<{ ns: number; title: string }>;
            }>;
            redirects: Array<{ from: string; to: string }>;
        }>(`https://${from}.wikipedia.org/w/api.php`, {
            action: 'query',
            prop: 'links',
            redirects: '',
            titles: title,
        });
        const candidates = res.pages[0].links.map((l) => l.title);
        console.log(`${WIKI_LANG[from]}维基条目“${title}”是一个消歧义页`, candidates);
        const disambiguated = pickDisambiguation(title, candidates, mediaTypes, from);
        if (disambiguated) {
            return langlinks(disambiguated, mediaTypes, from, to);
        }
        return undefined;
    }
    if (from === to) {
        console.log(`找到${WIKI_LANG[from]}维基条目“${title}”`);
        return {
            redirected: title,
            translated: title,
        };
    }
    const translated = from === to ? title : pageInfo.langlinks?.[0]?.title;
    if (!translated) {
        console.log(`未找到${WIKI_LANG[from]}维基条目“${title}”对应的${WIKI_LANG[to]}维基条目`);
        return { redirected: title };
    }
    console.log(`找到${WIKI_LANG[from]}维基条目“${title}”及对应的${WIKI_LANG[to]}维基条目“${translated}”`);
    return { redirected: title, translated };
}

async function parseZhTitle(title: string): Promise<string | undefined> {
    const result = await wikiApi<{
        pageid: number;
        title: string;
        displaytitle: string;
    }>(`https://zh.wikipedia.org/w/api.php`, {
        action: 'parse',
        page: title,
        prop: 'displaytitle',
    });
    if (!result?.displaytitle) console.log(`中文维基条目“${title}”解析为简体中文失败`);
    console.log(`中文维基条目“${title}”解析为简体中文“${result.displaytitle}”`);
    return result.displaytitle;
}

export async function translateByWiki(
    term: string,
    lang: WikiLang,
    mediaTypes: MediaType[],
): Promise<
    | {
          origin: string;
          originLink: string;
          translated?: string;
          translatedLink?: string;
      }
    | undefined
> {
    const translated = await langlinks(term, mediaTypes, lang, 'zh');
    if (!translated) return undefined;

    if (!translated.translated)
        return {
            origin: translated.redirected,
            originLink: `[维基百科（${WIKI_LANG[lang]}）](https://${lang}.wikipedia.org/wiki/${encodeURIComponent(
                translated.redirected,
            )})`,
        };

    const simplified = await parseZhTitle(translated.translated);
    return {
        origin: translated.redirected,
        originLink: `[维基百科（${WIKI_LANG[lang]}）](https://ja.wikipedia.org/wiki/${encodeURIComponent(
            translated.redirected,
        )})`,
        translated: simplified,
        translatedLink: `[维基百科](https://zh.wikipedia.org/zh-cn/${encodeURIComponent(translated.translated)})`,
    };
}
