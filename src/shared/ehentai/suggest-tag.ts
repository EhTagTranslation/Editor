import { isNamespaceName, isRawTag, RawTag } from '../raw-tag';
import { postApi, TagSuggestRequest, ResponseOf, get } from './api';
import type { NamespaceName } from '../interfaces/ehtag';

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
            namespace: tag.ns ?? 'other',
            raw: tag.tn,
        };
        tags.push(current);
        store(current);
        if ('mid' in tag) {
            const master: Tag = {
                id: tag.mid,
                namespace: tag.mns ?? 'other',
                raw: tag.mtn,
            };
            current.master = master;
            store(master);
        }
    }
    return tags;
}

/** 通过 https://repo.e-hentai.org/tools.php?act=taggroup 加载所有主标签，并设置缓存 */
export async function loadMasterTags(): Promise<Tag[]> {
    const tags = [];
    for (let i = 0; i <= 11; i++) {
        const response = (await get<string>(`http://repo.e-hentai.org/tools.php?act=taggroup&show=${i}`)).data;
        const namespace = /\[<span style="font-weight:bold">(\w+)<\/span>\]/.exec(response)?.[1];
        if (!isNamespaceName(namespace)) {
            continue;
        }
        const matches = response.matchAll(
            /<a href="https:\/\/repo\.e-hentai\.org\/tools\.php\?act=taggroup&amp;mastertag=(\d+)">(\w+):([-. \w]+)<\/a>/g,
        );
        for (const match of matches) {
            const id = Number.parseInt(match[1]);
            const ns = match[2];
            const tag = match[3];
            if (!isRawTag(tag) || !isNamespaceName(ns)) {
                console.warn(`Invalid tag match: ${match[0]}`);
                continue;
            }
            const current: Tag = {
                id,
                namespace: ns,
                raw: tag,
            };
            store(current);
            tags.push(current);
        }
    }
    return tags;
}

/** 通过 'tagsuggest' API 搜索标签，并设置缓存 */
export async function suggestTag(ns: NamespaceName | undefined, raw: string): Promise<Tag[]> {
    try {
        raw = raw.trim().toLowerCase();
        const text = `${ns != null ? ns + ':' : ''}${raw.slice(0, 100)}`;
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
