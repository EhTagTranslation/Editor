import { RawTag } from '../validate';
import { NamespaceName } from '../interfaces/ehtag';
import { tagCache, Tag, suggestTag } from './suggest-tag';

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
        const ns = tagCache.get(raw);
        if (ns && ns.size === 1) {
            [match] = ns.values();
        }
    }
    if (match == null) return undefined;
    if (match.master) {
        match = match.master;
    }
    return [match.namespace, match.raw];
}
