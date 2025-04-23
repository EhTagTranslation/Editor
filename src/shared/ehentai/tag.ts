import type { NamespaceName } from '../interfaces/ehtag.js';
import type { RawTag } from '../raw-tag.js';

export interface MasterTag {
    namespace: NamespaceName | 'temp';
    raw: RawTag;
    master?: undefined;
}
export interface SlaveTag {
    namespace: NamespaceName | 'temp';
    raw: RawTag;
    master: MasterTag;
}
export type Tag = MasterTag | SlaveTag;

const tagCache = new Map<RawTag, Map<NamespaceName | 'temp', Tag>>();

export function putTagCache(tag: Tag): void {
    const raw = tagCache.get(tag.raw);
    if (raw) {
        raw.set(tag.namespace, tag);
    } else {
        tagCache.set(tag.raw, new Map([[tag.namespace, tag]]));
    }
}

export function findTagCache(ns: NamespaceName, raw: RawTag): Tag | undefined {
    const nsMap = tagCache.get(raw);
    return nsMap?.get(ns);
}
