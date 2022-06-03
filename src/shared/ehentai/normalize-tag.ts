import { isRawTag, RawTag } from '../raw-tag';
import type { NamespaceName } from '../interfaces/ehtag';
import { isNamespaceName } from '../namespace';
import { suggestTag } from './suggest-tag';
import { get } from './http';
import { Tag, tagCache } from './tag';

const tagsFoundBySearch = new Set<`${NamespaceName}:${RawTag}`>();

async function searchTag(ns: NamespaceName, raw: RawTag): Promise<boolean> {
    const term = `${ns}:${raw}`;
    const result = await get<string>(`https://exhentai.org/tag/${term}`);
    if (!result.data || typeof result.data != 'string') {
        throw new Error(`无法访问 https://exhentai.org/tag/${term}`);
    }
    const tags = result.data.matchAll(/<div class="gtl?" title="([a-z]+):([-a-z0-9. ]+)">/g);
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

function searchCache(ns: NamespaceName, raw: RawTag): boolean {
    const term = `${ns}:${raw}` as const;
    return tagsFoundBySearch.has(term);
}

/**
 * 从 E 站标签数据库查找该标签是否存在，并找到对应主标签
 */
export async function normalizeTag(
    ns: NamespaceName | undefined,
    raw: RawTag,
): Promise<[NamespaceName, RawTag] | undefined> {
    if (ns && searchCache(ns, raw)) return [ns, raw];

    const nsMap = tagCache.get(raw);
    let match: Tag | undefined;
    if (ns && nsMap) {
        match = nsMap.get(ns);
    }

    match ??= await find(isMatch);
    match ??= await find(isMatchOrMove);

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
    return [match.namespace, match.raw];

    /** 使用 @see suggestTag 进行查找 */
    async function find(matcher: (tag: Tag) => boolean): Promise<Tag | undefined> {
        const resultGeneral = await suggestTag(undefined, raw);
        if (resultGeneral) {
            const match = resultGeneral.find(matcher);
            if (match) return match;
        }
        const resultNs = await suggestTag(ns, raw);
        if (resultNs != null) {
            const match = resultNs.find(isMatchOrMove);
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
