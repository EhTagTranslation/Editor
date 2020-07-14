import { RawTag } from '../validate';
import { postApi, TagSuggestRequest, ResponseOf } from './api';
import { NamespaceName } from '../interfaces/ehtag';

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

function expandResult(response: ResponseOf<TagSuggestRequest>): Tag[] {
    if (Array.isArray(response.tags)) return [];
    const tags = new Array<Tag>();
    for (const key in response.tags) {
        const tag = response.tags[key];
        tag.id = Number.parseInt(key);
        const current: Tag = {
            id: Number.parseInt(key),
            namespace: tag.ns ?? 'misc',
            raw: tag.tn,
        };
        tags.push(current);
        if ('mid' in tag) {
            const master: Tag = {
                id: tag.mid,
                namespace: tag.mns ?? 'misc',
                raw: tag.mtn,
            };
            current.master = master;
            tags.push(master);
        }
    }
    tags.forEach((tag) => {
        const raw = tagCache.get(tag.raw);
        if (raw) {
            raw.set(tag.namespace, tag);
        } else {
            tagCache.set(tag.raw, new Map([[tag.namespace, tag]]));
        }
    });
    return tags;
}

export async function suggestTag(ns: NamespaceName | undefined, raw: RawTag): Promise<Tag[]> {
    try {
        const text = `${ns != null ? ns + ':' : ''}${raw.slice(0, 50)}`;
        const response = await postApi<TagSuggestRequest>({
            method: 'tagsuggest',
            text,
        });
        const result = expandResult(response);
        if (result.length === 0 && raw.includes('.')) {
            return await suggestTag(ns, raw.slice(0, raw.indexOf('.') - 1) as RawTag);
        }
        return result;
    } catch (err) {
        console.error(err);
        throw err;
    }
}
