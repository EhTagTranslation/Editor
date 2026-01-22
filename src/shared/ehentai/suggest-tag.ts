import type { RawTag } from '../raw-tag.js';
import { api, type ApiRequest, type ResponseOf } from './http/index.js';
import type { NamespaceName } from '../interfaces/ehtag.js';
import { putTagCache, type MasterTag, type Tag } from './tag.js';
import { STATISTICS } from './statistics.js';

interface TagSuggestRequest extends ApiRequest<
    'tagsuggest',
    { tags: Record<number, ApiMasterTag | ApiSlaveTag> | [] }
> {
    text: string;
}

interface ApiMasterTag {
    id: number;
    ns: NamespaceName | 'temp';
    tn: RawTag;
}

interface ApiSlaveTag extends ApiMasterTag {
    mid: number;
    mns: NamespaceName;
    mtn: RawTag;
}

/** 解析响应，并设置标签缓存 */
function expandResult(response: ResponseOf<TagSuggestRequest>): Tag[] {
    if (Array.isArray(response.tags)) return [];
    const tags: Tag[] = [];
    for (const key in response.tags) {
        const tag = response.tags[key];
        tag.id = Number.parseInt(key);
        let master: MasterTag | undefined;
        if ('mid' in tag) {
            master = {
                namespace: tag.mns ?? 'other',
                raw: tag.mtn,
            };
            putTagCache(master);
        }
        const current: Tag = {
            namespace: tag.ns ?? 'other',
            raw: tag.tn,
            master,
        };
        tags.push(current);
        putTagCache(current);
    }
    return tags;
}

const suggestCache = new Map<string, readonly Tag[]>();

/** 调用 'tagsuggest' API，并设置缓存 */
async function suggestTagImpl(text: string): Promise<readonly Tag[]> {
    const cache = suggestCache.get(text);
    if (cache) return cache;

    try {
        STATISTICS.tagSuggest++;
        const response = await api<TagSuggestRequest>({
            method: 'tagsuggest',
            text,
        });
        const result = expandResult(response);
        suggestCache.set(text, result);
        return result;
    } catch (err) {
        console.error(err);
        throw err;
    }
}

/** 通过 'tagsuggest' API 搜索标签，并设置缓存 */
export async function suggestTag(
    ns: NamespaceName | undefined,
    raw: string,
    exactMatch = false,
): Promise<readonly Tag[]> {
    if (ns === 'rows') return [];
    raw = raw.trim().toLowerCase();
    const text = `${ns != null ? ns + ':' : ''}${raw}${exactMatch ? '$' : ''}`;
    const result = await suggestTagImpl(text);
    if (
        !exactMatch &&
        ns &&
        result.length > 0 &&
        result.find(
            (t) => (t.raw === raw && ns === t.namespace) || (t.master?.raw === raw && ns === t.master.namespace),
        ) == null
    ) {
        // 没有正确匹配时升级为精确搜索
        const exactResult = await suggestTag(ns, raw, true);
        if (exactResult.length !== 0) return exactResult;
    }
    return result;
}
