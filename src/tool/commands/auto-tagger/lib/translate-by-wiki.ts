import { request } from '../../../../shared/ehentai/http';

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

async function langlinks(
    title: string,
    from: string,
    to: string,
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
                lang: string;
                title: string;
            }>;
        }>;
        redirects: Array<{ from: string; to: string }>;
    }>(`https://${from}.wikipedia.org/w/api.php`, {
        action: 'query',
        prop: 'langlinks',
        redirects: '',
        titles: title,
        lllang: to,
    });
    if (res.redirects?.[0]?.from === title) {
        console.log(`日文维基条目“${title}”重定向到“${res.redirects[0].to}”`);
        title = res.redirects[0].to;
    }
    const pageInfo = res.pages?.[0];
    if (!pageInfo?.pageid) {
        console.log(`未找到日文维基条目“${title}”`);
        return undefined;
    }
    const translated = pageInfo.langlinks?.[0]?.title;
    if (!translated) {
        console.log(`未找到日文维基条目“${title}”对应的中文维基条目`);
        return {
            redirected: title,
        };
    }
    console.log(`找到日文维基条目“${title}”及对应的中文维基条目“${translated}”`);
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

export async function translateByWiki(term: string): Promise<
    | {
          origin: string;
          originLink: string;
          translated?: string;
          translatedLink?: string;
      }
    | undefined
> {
    const translated = await langlinks(term, 'ja', 'zh');
    if (!translated) return undefined;

    if (!translated.translated)
        return {
            origin: translated.redirected,
            originLink: `[维基百科（日语）](https://ja.wikipedia.org/wiki/${encodeURIComponent(
                translated.redirected,
            )})`,
        };

    const simplified = await parseZhTitle(translated.translated);
    return {
        origin: translated.redirected,
        originLink: `[维基百科（日语）](https://ja.wikipedia.org/wiki/${encodeURIComponent(translated.redirected)})`,
        translated: simplified,
        translatedLink: `[维基百科](https://zh.wikipedia.org/zh-cn/${encodeURIComponent(translated.translated)})`,
    };
}
