import type { RawTag } from '../raw-tag';
import { api, ApiRequest, ResponseOf } from './http';
import type { NamespaceName } from '../interfaces/ehtag';
import { SlaveTag, store, Tag } from './tag';

interface TagSuggestRequest
    extends ApiRequest<
        'tagsuggest',
        {
            tags: Record<number, ApiMasterTag | ApiSlaveTag> | [];
        }
    > {
    text: string;
}

interface ApiMasterTag {
    id: number;
    ns: NamespaceName;
    tn: RawTag;
}

interface ApiSlaveTag extends ApiMasterTag {
    mid: number;
    mns: NamespaceName;
    mtn: RawTag;
}

function expandResult(response: ResponseOf<TagSuggestRequest>): Tag[] {
    if (Array.isArray(response.tags)) return [];
    const tags: Tag[] = [];
    for (const key in response.tags) {
        const tag = response.tags[key];
        tag.id = Number.parseInt(key);
        const current = {
            id: Number.parseInt(key),
            namespace: tag.ns ?? 'other',
            raw: tag.tn,
        } as Tag;
        tags.push(current);
        store(current);
        if ('mid' in tag) {
            const master: Tag = {
                id: tag.mid,
                namespace: tag.mns ?? 'other',
                raw: tag.mtn,
            };
            (current as SlaveTag).master = master;
            store(master);
        }
    }
    return tags;
}

const suggestCache = new Map<string, Tag[]>();

/** 通过 'tagsuggest' API 搜索标签，并设置缓存 */
export async function suggestTag(ns: NamespaceName | undefined, raw: string): Promise<Tag[]> {
    raw = raw.trim().toLowerCase();
    const text = `${ns != null ? ns + ':' : ''}${raw}`;
    const cache = suggestCache.get(text);
    if (cache) return cache;

    try {
        const response = await api<TagSuggestRequest>({
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
