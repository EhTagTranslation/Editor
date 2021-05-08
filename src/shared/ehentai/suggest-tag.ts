import { RawTag } from '../validate';
import { postApi, TagSuggestRequest, ResponseOf } from './api';
import { NamespaceName } from '../interfaces/ehtag';

const suggestCache = new Map<string, Tag[]>();
export const tagCache = new Map<RawTag, Map<NamespaceName, Tag>>();

interface MasterTag {
    id: number;
    namespace: NamespaceName;
    raw: RawTag;
    master?: MasterTag;
}
interface SlaveTag extends MasterTag {
    id: number;
    namespace: NamespaceName;
    raw: RawTag;
    master: MasterTag;
}
export type Tag = MasterTag | SlaveTag;

function store(tag: Tag): void {
    const raw = tagCache.get(tag.raw);
    if (raw) {
        raw.set(tag.namespace, tag);
    } else {
        tagCache.set(tag.raw, new Map([[tag.namespace, tag]]));
    }
}

function expandResult(response: ResponseOf<TagSuggestRequest>): Tag[] {
    if (Array.isArray(response.tags)) return [];
    const tags: Tag[] = [];
    for (const key in response.tags) {
        const tag = response.tags[key];
        tag.id = Number.parseInt(key);
        const current: Tag = {
            id: Number.parseInt(key),
            namespace: tag.ns ?? 'misc',
            raw: tag.tn,
        };
        tags.push(current);
        store(current);
        if ('mid' in tag) {
            const master: Tag = {
                id: tag.mid,
                namespace: tag.mns ?? 'misc',
                raw: tag.mtn,
            };
            current.master = master;
            store(master);
        }
    }
    return tags;
}

export async function suggestTag(ns: NamespaceName | undefined, raw: string): Promise<Tag[]> {
    try {
        raw = raw.trim().toLowerCase();
        const text = `${ns != null ? ns + ':' : ''}${raw.slice(0, 50)}`;
        const cache = suggestCache.get(text);
        if (cache) return cache;
        const response = await postApi<TagSuggestRequest>({
            method: 'tagsuggest',
            text,
        });
        const result = expandResult(response);
        if (result.length === 0 && raw.includes('.')) {
            return await suggestTag(ns, raw.slice(0, raw.indexOf('.') - 1) as RawTag);
        }
        suggestCache.set(text, result);
        return result;
    } catch (err) {
        console.error(err);
        throw err;
    }
}
