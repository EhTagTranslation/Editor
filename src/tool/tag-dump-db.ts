import { DatabaseSync } from 'node:sqlite';
import { createGunzip } from 'node:zlib';
import path from 'node:path';
import os from 'node:os';
import { createWriteStream } from 'node:fs';
import { pipeline } from 'node:stream/promises';
import { get } from '#shared/ehentai/http/index';
import type { NamespaceName } from '#shared/interfaces/ehtag';
import type { RawTag } from '#shared/raw-tag';
import type { GalleryId } from '#shared/ehentai/list-galleries';

let db: DatabaseSync | undefined;
async function init(): Promise<DatabaseSync> {
    if (db) return db;

    const res = await get('https://github.com/EhTagTranslation/EhTagDb/releases/latest/download/aggregated.sqlite.gz', {
        responseType: 'stream',
    });
    const tmp = path.join(os.tmpdir(), 'ehdb.sqlite');
    await pipeline(res.data as NodeJS.ReadableStream, createGunzip(), createWriteStream(tmp));
    db = new DatabaseSync(tmp, { readOnly: true });
    return db;
}

interface TagInfo {
    namespace: NamespaceName;
    tag: RawTag;
    count: number;
    galleries: readonly GalleryId[];
}

function parseRecord(record: Record<string, unknown>): TagInfo {
    const galleriesStr = record['galleries'] as string;
    const galleries = galleriesStr ? galleriesStr.split('\n').filter(Boolean) : [];
    return {
        namespace: record['namespace'] as NamespaceName,
        tag: record['tag'] as RawTag,
        count: Number(record['count']),
        galleries: galleries.map((line) => {
            const [id, token] = line.split('/');
            return [Number(id), token] as GalleryId;
        }),
    } satisfies TagInfo;
}

export async function getAllTagInfo(): Promise<TagInfo[]> {
    const db = await init();
    const records = db.prepare('SELECT * FROM tag_aggregate').all();
    return records.map(parseRecord);
}

export async function getTagInfo(ns: NamespaceName, tag: RawTag): Promise<TagInfo | undefined> {
    const db = await init();
    const record = db.prepare('SELECT * FROM tag_aggregate WHERE namespace = ? AND tag = ?').get(ns, tag) as Record<
        keyof TagInfo,
        string
    >;
    if (!record) return undefined;
    return parseRecord(record);
}
