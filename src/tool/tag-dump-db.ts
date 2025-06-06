import type { DatabaseSync } from 'node:sqlite';
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

    console.log(`加载 E 站 Api Dump 数据库...`);
    const { DatabaseSync } = await import('node:sqlite');
    const res = await get('https://github.com/EhTagTranslation/EhTagDb/releases/latest/download/aggregated.sqlite.gz', {
        responseType: 'stream',
    });
    const tmp = path.join(os.tmpdir(), 'ehdb.sqlite');
    await pipeline(res.data as NodeJS.ReadableStream, createGunzip(), createWriteStream(tmp));
    db = new DatabaseSync(tmp, { readOnly: true });
    const count = db.prepare('SELECT count(*) as size FROM tag_aggregate').get()!['size'] as number;
    console.log(`从 E 站 Api Dump 数据库加载了 ${count} 个标签`);
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
/** 获取所有 Api Dump 数据 */
export async function getAllTagInfo(): Promise<TagInfo[]> {
    const db = await init();
    const records = db.prepare('SELECT * FROM tag_aggregate').all();
    return records.map(parseRecord);
}

/** 查询 Api Dump 数据 */
export async function getTagInfo(ns: NamespaceName, tag: RawTag): Promise<TagInfo | undefined> {
    const db = await init();
    const record = db.prepare('SELECT * FROM tag_aggregate WHERE namespace = ? AND tag = ?').get(ns, tag) as Record<
        keyof TagInfo,
        string
    >;
    if (!record) return undefined;
    return parseRecord(record);
}

/** 查询 Api Dump 数据 */
export async function getTagsInfo(tag: RawTag): Promise<TagInfo[]> {
    const db = await init();
    const records = db.prepare('SELECT * FROM tag_aggregate WHERE tag = ?').all(tag) as Array<
        Record<keyof TagInfo, string>
    >;
    return records.map(parseRecord);
}
