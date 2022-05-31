import { Context, parse, render } from '../../../shared/markdown';
import type { NamespaceName, Tag } from '../../../shared/interfaces/ehtag';
import type { RawTag } from '../../../shared/raw-tag';
import { parseTag } from '../tag/command';
import { command } from './command';
import { searchEhWiki } from './lib/search-eh-wiki';
import { Gallery, searchTag } from './lib/search-tag';
import { translateByWiki } from './lib/translate-by-wiki';

async function findJaInGalleryTitles(raw: RawTag, galleries: Gallery[], page = 1): Promise<string | undefined> {
    let found;
    const counter = galleries.reduce((c, g) => {
        const parody = g.parsed_jpn.parody;
        if (parody && parody !== 'よろず') {
            c[parody] = (c[parody] ?? 0) + 1;
        }
        return c;
    }, {} as Record<string, number>);
    for (const key in counter) {
        const splited = key.split(/(, |、)/g);
        if (splited.length >= 2) {
            for (const parody of splited) {
                // 只有当原作标签至少单独出现过一次时，才增加权重
                if (parody in counter) {
                    counter[parody] += counter[key];
                }
            }
        }
    }
    console.log(`基于 ${galleries.length} 条搜索结果查找翻译`, counter);
    let max = 0;
    let sum = 0;
    for (const key in counter) {
        const count = counter[key];
        sum += count;
        if (count > max) {
            max = count;
            found = key;
        }
    }
    if (max * 2 < sum) {
        if (page * 25 === galleries.length) {
            console.log(`置信度不足，加载更多结果`);
            const nextPage = await searchTag(`parody`, raw, page);
            return findJaInGalleryTitles(raw, [...galleries, ...nextPage], page + 1);
        } else {
            console.log(`置信度不足`);
            found = undefined;
        }
    }
    return found;
}

async function translateParody(raw: RawTag, galleries: Gallery[]): Promise<Tag<'raw'> | undefined> {
    const ehWiki = await searchEhWiki(raw);
    let found = ehWiki;
    if (!ehWiki) {
        const foundInGalleries = await findJaInGalleryTitles(raw, galleries);
        if (foundInGalleries) {
            found = ['ja', [], foundInGalleries];
        }
    }
    if (!found) return undefined;
    const translated = await translateByWiki(found[2], found[0], found[1]);
    if (!translated) {
        if (!ehWiki) return undefined;
        return {
            name: ehWiki[2],
            intro: '',
            links: `[EhWiki](https://ehwiki.org/wiki/${raw.replace(/\s/g, '_')})`,
        };
    }
    return {
        name: translated.translated ?? translated.origin,
        intro: '',
        links: translated.translatedLink ?? translated.originLink,
    };
}

export async function translate(ns: NamespaceName, raw: RawTag): Promise<Tag<'raw'>> {
    const galleries = await searchTag(ns, raw);
    if (galleries.length === 0) throw new Error('未找到标签');
    switch (ns) {
        case 'parody': {
            const translated = await translateParody(raw, galleries);
            if (!translated) throw new Error(`查找翻译失败`);
            return translated;
        }
        default:
            throw new Error(`不支持的命名空间 ${ns}`);
    }
}

command
    .command('translate')
    .description('翻译标签')
    .argument('tag', '要翻译的标签')
    .action(async (tag: string) => {
        const [ns, raw] = parseTag(tag);
        if (!ns) {
            console.error('标签必须包含命名空间');
            process.exitCode = 1;
            return;
        }
        try {
            const translated = await translate(ns, raw);
            const normalize = (x: string): string => render(parse(x, Context.fake), 'raw');
            console.log(
                `生成结果：
    原始标签：${ns}:${raw}
    名    称：${normalize(translated.name)}
    描    述：${normalize(translated.intro)}
    外部链接：${normalize(translated.links)}`,
            );
        } catch (ex) {
            console.error((ex as Error).message);
            process.exitCode = 1;
            return;
        }
    });
