import { isRawTag } from '../raw-tag.js';
import { isNamespaceName } from '../namespace.js';
import { get } from './http/index.js';
import { type MasterTag, store } from './tag.js';

/**
 * 通过 https://repo.e-hentai.org/tools.php?act=taggroup
 * 加载所有主标签，并设置缓存
 */
export async function getTagGroups(): Promise<MasterTag[]> {
    const tags = [];
    for (let i = 0; i <= 11; i++) {
        const response = (await get<string>(`https://repo.e-hentai.org/tools/taggroup?show=${i}`)).data;
        const namespace = /\[<span style="font-weight:bold">(\w+)<\/span>\]/.exec(response)?.[1];
        if (!isNamespaceName(namespace)) {
            continue;
        }
        const matches = response.matchAll(
            /<a href="https:\/\/repo\.e-hentai\.org\/tools\/taggroup\?mastertag=(\d+)">(\w+):([-. \w]+)<\/a>/g,
        );
        for (const match of matches) {
            const id = Number.parseInt(match[1]);
            const ns = match[2];
            const tag = match[3];
            if (!isRawTag(tag) || !isNamespaceName(ns)) {
                console.warn(`Invalid tag match: ${match[0]}`);
                continue;
            }
            const current: MasterTag = {
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
