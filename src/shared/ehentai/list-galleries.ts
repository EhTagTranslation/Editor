import type { RawTag } from '../raw-tag.js';
import { api, type ApiRequest } from './http/index.js';
import type { NamespaceName } from '../interfaces/ehtag.js';
import { store } from './tag.js';
import { STATISTICS } from './statistics.js';
import { parseTag } from '#shared/tag';

interface GalleryListRequest
    extends ApiRequest<
        'gdata',
        {
            gmetadata: Array<GalleryMetadata | { gid: number; error: string }>;
        }
    > {
    gidlist: readonly GalleryId[];
    namespace: 1;
}

interface GalleryMetadata {
    gid: number;
    token: string;
    title: string;
    title_jpn?: string;
    tags: Array<`${NamespaceName}:${RawTag}`>;
}

type GalleryId = [id: number, token: string];

/** 通过 'tagsuggest' API 搜索标签，并设置缓存 */
export async function listGalleries(list: readonly GalleryId[]): Promise<GalleryMetadata[]> {
    STATISTICS.galleryList++;
    const response = await api<GalleryListRequest>({
        method: 'gdata',
        gidlist: list,
        namespace: 1,
    });
    if (!Array.isArray(response.gmetadata)) return [];
    const galleries: GalleryMetadata[] = [];
    for (const meta of response.gmetadata) {
        if ('error' in meta) continue;
        galleries.push(meta);
        for (const tag of meta.tags) {
            const parsed = parseTag(tag);
            if (!parsed.valid || !parsed.ns) continue;
            store({
                namespace: parsed.ns,
                raw: parsed.raw,
            });
        }
    }
    return galleries;
}
