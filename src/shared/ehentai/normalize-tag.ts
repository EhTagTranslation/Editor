import { isRawTag, RawTag } from '../raw-tag.js';
import type { NamespaceName } from '../interfaces/ehtag.js';
import { isNamespaceName } from '../namespace.js';
import { suggestTag } from './suggest-tag.js';
import { get } from './http/index.js';
import { type Tag, tagCache } from './tag.js';
import { STATISTICS } from './statistics.js';

const tagsFoundBySearch = new Set<`${NamespaceName}:${RawTag}`>();

let useEx = true;

/** 访问搜索页面，返回文档内容 */
async function searchTagImpl(ns: NamespaceName, raw: RawTag): Promise<string> {
    const url = `https://${useEx ? 'ex' : 'e-'}hentai.org/tag/${ns}:${raw}`;
    STATISTICS.tagSearch++;
    try {
        const result = await get<string>(url);
        if (!result.data || typeof result.data != 'string') {
            throw new Error(`无法访问 ${url}`);
        }
        return result.data;
    } catch (ex) {
        if (!useEx) {
            throw ex;
        }
        console.warn(`Ex 访问失败，回退到 Eh`);
        useEx = false;
        return searchTagImpl(ns, raw);
    }
}

/** 通过搜索功能确定 tag 是否存在 */
async function searchTag(ns: NamespaceName, raw: RawTag): Promise<boolean> {
    const result = await searchTagImpl(ns, raw);
    const tags = result.matchAll(/<div class="gtl?" title="([a-z]+):([-a-z0-9. ]+)">/g);
    let found = false;
    for (const tag of tags) {
        const [, tNs, tRaw] = tag;
        if (!isNamespaceName(tNs) || !isRawTag(tRaw)) continue;
        if (tRaw === raw && tNs === ns) {
            found = true;
        }
        tagsFoundBySearch.add(`${tNs}:${tRaw}`);
    }
    return found;
}

function findSearchCache(ns: NamespaceName, raw: RawTag): boolean {
    const term = `${ns}:${raw}` as const;
    return tagsFoundBySearch.has(term);
}

function findTagCache(ns: NamespaceName, raw: RawTag): Tag | undefined {
    const nsMap = tagCache.get(raw);
    return nsMap?.get(ns);
}

/**
 * 从 E 站标签数据库查找该标签是否存在，并找到对应主标签
 */
export async function normalizeTag(
    ns: NamespaceName | undefined,
    raw: RawTag,
): Promise<[NamespaceName, RawTag] | undefined> {
    if (ns && findSearchCache(ns, raw)) return [ns, raw];

    let match: Tag | undefined;

    if (ns) {
        match ??= findTagCache(ns, raw);
        if (!match) {
            // 填充缓存
            const words = raw.split(' ');
            let part = '';
            for (const word of words) {
                if (part) part += ` ${word}`;
                else part = word;

                if (part.length > 1) {
                    await suggestTag(undefined, part);
                    match ??= findTagCache(ns, raw);
                }
                if (match) break;
            }
        }
    }

    if (raw.length > 1) {
        match ??= await find(isMatch, false);
    }
    match ??= await find(isMatch, true);
    match ??= await find(isMatchOrMove, true);

    if (match == null) {
        // 短于 2 字符的标签、重命名为更长且包含原名的标签（abc => abcde）、作为子串出现超过 10 次的标签
        // 不会从 suggest API 返回，使用标签搜索功能进行检查
        if (ns && (await searchTag(ns, raw))) return [ns, raw];
        else return undefined;
    }
    if (match.master) {
        // 标签发生移动的，返回主标签
        match = match.master;
    }
    if (match.namespace === 'temp') {
        // 临时标签认为不存在
        return undefined;
    }
    return [match.namespace, match.raw];

    /** 使用 @see suggestTag 进行查找 */
    async function find(matcher: (tag: Tag) => boolean, useNs: boolean): Promise<Tag | undefined> {
        const result = await suggestTag(useNs ? ns : undefined, raw);
        if (result != null) {
            const match = result.find(matcher);
            if (match) return match;
        }
        return undefined;
    }

    /** 严格命中 */
    function isMatch(tag: Tag): boolean {
        // 严格命中
        if (tag.namespace === ns && tag.raw === raw) return true;
        return false;
    }

    /** 从 temp 移动到期望的命名空间 */
    function isMatchOrMove(tag: Tag): boolean {
        if (isMatch(tag)) return true;
        if ((tag.namespace as string) === 'temp' && tag.raw === raw && (!ns || tag.master?.namespace === ns))
            return true;
        return false;
    }
}
