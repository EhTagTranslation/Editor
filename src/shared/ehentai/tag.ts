import type { NamespaceName } from '../interfaces/ehtag.js';
import type { RawTag } from '../raw-tag.js';

export interface MasterTag {
    id: number;
    namespace: NamespaceName;
    raw: RawTag;
    master?: undefined;
}
export interface SlaveTag {
    id: number;
    namespace: NamespaceName;
    raw: RawTag;
    master: MasterTag;
}
export type Tag = MasterTag | SlaveTag;

export const tagCache = new Map<RawTag, Map<NamespaceName, Tag>>();

export function store(tag: Tag): void {
    const raw = tagCache.get(tag.raw);
    if (raw) {
        raw.set(tag.namespace, tag);
    } else {
        tagCache.set(tag.raw, new Map([[tag.namespace, tag]]));
    }
}
