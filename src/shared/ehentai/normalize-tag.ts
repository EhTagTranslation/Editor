import type { RawTag } from '../validate';
import type { NamespaceName } from '../interfaces/ehtag';
import { tagCache, Tag, suggestTag } from './suggest-tag';

/**
 * 从 E 站标签数据库查找该标签是否存在，并找到对应主标签
 */
export async function normalizeTag(
    ns: NamespaceName | undefined,
    raw: RawTag,
): Promise<[NamespaceName, RawTag] | undefined> {
    // short tags will not returned by suggest api
    if (raw.length <= 2) return [ns as NamespaceName, raw];

    const nsMap = tagCache.get(raw);
    let match: Tag | undefined;
    if (ns && nsMap) {
        match = nsMap?.get(ns);
    }
    if (match == null) {
        const result = await suggestTag(undefined, raw);
        if (result != null) {
            match = result.find((tag) => tag.namespace === ns && tag.raw === raw);
        }
    }
    if (match == null) {
        const result = await suggestTag(ns, raw);
        if (result != null) {
            match = result.find((tag) => tag.namespace === ns && tag.raw === raw);
        }
    }
    if (match == null) {
        const nsMap = tagCache.get(raw);
        if (nsMap && nsMap.size === 1) {
            [match] = nsMap.values();
        }
    }
    if (match == null) return undefined;
    if (match.master) {
        match = match.master;
    }
    return [match.namespace, match.raw];
}
