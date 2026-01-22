import type { RawTag } from '../raw-tag.js';
import { api, type ApiRequest } from './http/index.js';
import type { NamespaceName } from '../interfaces/ehtag.js';
import { putTagCache } from './tag.js';
import { STATISTICS } from './statistics.js';
import { parseTag } from '#shared/tag';

interface GalleryListRequest extends ApiRequest<'gdata', { gmetadata: Array<GalleryMetadata | GalleryMetadataError> }> {
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

interface GalleryMetadataError {
    gid: number;
    error: string;
}

export type GalleryId = [id: number, token: string];

/** 通过 'gdata' API 查询画廊元数据，并设置标签缓存 */
async function listGalleriesPage(list: readonly GalleryId[]): Promise<Array<GalleryMetadata | GalleryMetadataError>> {
    STATISTICS.galleryList++;
    const response = await api<GalleryListRequest>({
        method: 'gdata',
        gidlist: list,
        namespace: 1,
    });
    const galleries = response.gmetadata;
    if (!Array.isArray(galleries)) return [];
    for (const meta of galleries) {
        if ('error' in meta) continue;
        for (const tag of meta.tags) {
            const parsed = parseTag(tag);
            if (!parsed.valid || !parsed.ns) continue;
            putTagCache({
                namespace: parsed.ns,
                raw: parsed.raw,
            });
        }
    }
    return galleries;
}

const PAGE_SIZE = 25;
/** 通过 'gdata' API 查询画廊元数据，并设置标签缓存 */
export async function listGalleries(
    list: readonly GalleryId[],
): Promise<Array<GalleryMetadata | GalleryMetadataError>> {
    if (!Array.isArray(list) || list.length === 0) return [];
    if (list.length <= PAGE_SIZE) return listGalleriesPage(list);

    const galleries: Array<GalleryMetadata | GalleryMetadataError> = [];
    for (let i = 0; i < list.length; i += PAGE_SIZE) {
        const page = list.slice(i, i + PAGE_SIZE);
        const result = await listGalleriesPage(page);
        galleries.push(...result);
    }
    return galleries;
}
