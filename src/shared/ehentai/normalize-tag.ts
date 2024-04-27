import { isRawTag, RawTag } from '../raw-tag.js';
import type { NamespaceName } from '../interfaces/ehtag.js';
import { isNamespaceName } from '../namespace.js';
import { suggestTag } from './suggest-tag.js';
import { get } from './http/index.js';
import { type Tag, tagCache } from './tag.js';
import { STATISTICS } from './statistics.js';

const tagsFoundBySearch = new Set<`${NamespaceName}:${RawTag}`>();

/** 开始时默认使用 ex，访问失败时回退到 eh，之后都使用 eh */
let useEx = true;
/** 第一次访问设置 extend view */
let setExtendView = true;

/** 访问搜索页面，返回文档内容 */
async function getSearchPage(term: string): Promise<string> {
    const base = `https://${useEx ? 'ex' : 'e-'}hentai.org/`;
    const search = `f_search=${term}&f_cats=0&f_sfl=on&f_sfu=on&f_sft=on` + (setExtendView ? '&inline_set=dm_e' : '');
    const url = `${base}?${search}`;
    STATISTICS.tagSearch++;
    try {
        const result = await get<string>(url);
        if (!result.data || typeof result.data != 'string') {
            throw new Error(`无法访问 ${url}`);
        }
        const isExtendView = result.data.includes('<option value="e" selected="selected">');
        if (!isExtendView && !setExtendView) {
            setExtendView = true;
            return getSearchPage(term);
        }
        setExtendView = false;
        return result.data;
    } catch (ex) {
        if (!useEx) {
            throw ex;
        }
        console.warn(`Ex 访问失败，回退到 Eh: ${String(ex)}`);
        useEx = false;
        setExtendView = true;
        return getSearchPage(term);
    }
}

/** 生成搜索词 */
function getSearchTerm(ns: NamespaceName | undefined, raw: RawTag, exact: boolean): string {
    const head = ns ? `${ns}:"` : '"';
    const tail = exact ? '"$' : '"';
    const term = `${head}${raw}${tail}`;
    return encodeURIComponent(term);
}

/** 通过搜索功能确定 tag 是否存在 */
async function searchTagImpl(ns: NamespaceName, raw: RawTag, useNs: boolean): Promise<boolean> {
    // workaround for blocked keywords https://ehwiki.org/wiki/Gallery_Searching#Search_Limitations
    // eg: artist:incognitymous
    const term = getSearchTerm(useNs ? ns : undefined, raw, useNs);
    const result = await getSearchPage(term);
    let found = false;
    const tags = result.matchAll(/<div class="gtl?" title="([a-z]+):([-a-z0-9. ]+)">/g);
    for (const tag of tags) {
        const [, tNs, tRaw] = tag;
        if (!isNamespaceName(tNs) || !isRawTag(tRaw)) {
            continue;
        }
        if (tRaw === raw && tNs === ns) {
            found = true;
        }
        tagsFoundBySearch.add(`${tNs}:${tRaw}`);
    }
    return found;
}

/** 通过搜索功能确定 tag 是否存在 */
async function searchTag(ns: NamespaceName, raw: RawTag): Promise<boolean> {
    if (ns === 'rows') return false;
    if (ns === 'reclass' && raw === 'private') return false;

    // 对短标签优先使用命名空间
    const preferUseNs = raw.length <= 5;

    return (await searchTagImpl(ns, raw, preferUseNs)) || (await searchTagImpl(ns, raw, !preferUseNs));
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

    if (raw.length > 1 && match == null) {
        const source = await suggestTag(undefined, raw);
        const candidates = source.filter((t) => t.raw === raw);
        if (ns) {
            match = candidates.find((t) => t.namespace === ns);
        }
        if (match == null && candidates.length === 1 && source.length < 10) {
            // 只有一个结果，且原始结果完整
            match = candidates[0];
        }
    }
    if (ns && match == null) {
        match ??= await find(isMatch);
        match ??= await find(isMatchOrMove);
    }

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
    async function find(matcher: (tag: Tag) => boolean): Promise<Tag | undefined> {
        const result = await suggestTag(ns, raw);
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
