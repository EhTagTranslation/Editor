import { isRawTag, type RawTag } from '#shared/raw-tag';
import type { NamespaceName } from '#shared/interfaces/ehtag';
import { isNamespaceName } from '#shared/namespace';
import { get } from '#shared/ehentai/http/index';
import { STATISTICS } from '#shared/ehentai/statistics';
import { findTagCache, suggestTag, listGalleries, type Tag, putTagCache } from '#shared/ehentai/index';
import { getTagInfo, getTagsInfo } from './tag-dump-db';
import type { MasterTag } from '#shared/ehentai/tag';

const TAG_REGEX = /<div class="gtl?" title="([a-z]+):([-a-z0-9. ]+)">/g;

/** 第一次访问设置 extend view */
const setExtendView: Record<`${boolean}`, boolean> = { true: true, false: true };

/** 访问搜索页面，返回文档内容 */
async function getSearchPageTags(term: string, useEx: boolean): Promise<void> {
    const base = `https://${useEx ? 'ex' : 'e-'}hentai.org/`;
    const search =
        `f_search=${term}&f_cats=0&f_sfl=on&f_sfu=on&f_sft=on` + (setExtendView[`${useEx}`] ? '&inline_set=dm_e' : '');
    const url = `${base}?${search}`;
    STATISTICS.tagSearch++;
    try {
        const result = await get<string>(url, {
            transformResponse: (data, headers, status) => {
                if (!status || status < 200 || status >= 300) {
                    throw new Error(`状态码无效：${status} ${JSON.stringify(data)}`);
                }
                if (typeof data !== 'string') {
                    throw new Error(`返回数据类型错误：${status} ${typeof data}`);
                }
                if (!data) {
                    throw new Error(`返回数据为空：${status}`);
                }
                return data;
            },
        });
        const isExtendView = result.data.includes('<option value="e" selected="selected">');
        if (!isExtendView && !setExtendView[`${useEx}`]) {
            setExtendView[`${useEx}`] = true;
            return getSearchPageTags(term, useEx);
        }
        setExtendView[`${useEx}`] = false;
        const { data } = result;
        const tags = data.matchAll(TAG_REGEX);
        for (const tag of tags) {
            const [, tNs, tRaw] = tag;
            if (!isNamespaceName(tNs) || !isRawTag(tRaw)) {
                continue;
            }
            const tTag: MasterTag = { namespace: tNs, raw: tRaw };
            putTagCache(tTag);
        }
    } catch (ex) {
        setExtendView[`${useEx}`] = true;
        throw ex;
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
    try {
        await getSearchPageTags(term, false);
    } catch (ex) {
        console.warn(`在 eh 搜索 ${term} 失败: ${String(ex)}`);
    }
    if (findTagCache(ns, raw)) {
        return true;
    }
    try {
        await getSearchPageTags(term, true);
    } catch (ex) {
        console.warn(`在 ex 搜索 ${term} 失败: ${String(ex)}`);
    }
    if (findTagCache(ns, raw)) {
        return true;
    }
    return false;
}

/** 通过搜索功能确定 tag 是否存在 */
async function searchTag(ns: NamespaceName, raw: RawTag): Promise<boolean> {
    if (ns === 'rows' || ns === 'reclass') return false;

    // 对短标签优先使用命名空间
    const preferUseNs = raw.length <= 5;

    return (await searchTagImpl(ns, raw, preferUseNs)) || (await searchTagImpl(ns, raw, !preferUseNs));
}

/**
 * 从 E 站标签数据库查找该标签是否存在，并找到对应主标签
 */
export async function normalizeTag(
    ns: NamespaceName | undefined,
    raw: RawTag,
): Promise<[NamespaceName, RawTag] | undefined> {
    let match: Tag | undefined;

    if (ns) {
        match ??= findTagCache(ns, raw);
    }

    if (ns && match == null) {
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
        if (ns) {
            const dumpTag = await getTagInfo(ns, raw);
            if (dumpTag) {
                await listGalleries(dumpTag.galleries);
                match = findTagCache(ns, raw);
            }
        } else {
            const dumpTags = await getTagsInfo(raw);
            for (const dumpTag of dumpTags) {
                await listGalleries(dumpTag.galleries);
                match ??= findTagCache(dumpTag.namespace, raw);
            }
        }
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
