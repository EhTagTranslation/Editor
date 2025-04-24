import { isRawTag } from '#shared/raw-tag';
import { isNamespaceName } from '#shared/namespace';
import { get } from '#shared/ehentai/http/index';
import { type MasterTag, putTagCache } from '#shared/ehentai/tag';

/**
 * 通过 https://repo.e-hentai.org/tools.php?act=taggroup
 * 加载所有主标签，并设置缓存
 */
export async function getTagGroups(): Promise<MasterTag[]> {
    console.log('加载 E 站 tag group 工具数据...');
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
            // const id = Number.parseInt(match[1]);
            const ns = match[2];
            const tag = match[3];
            if (!isRawTag(tag) || !isNamespaceName(ns)) {
                console.warn(`Invalid tag match: ${match[0]}`);
                continue;
            }
            const current: MasterTag = {
                namespace: ns,
                raw: tag,
            };
            putTagCache(current);
            tags.push(current);
        }
    }
    console.log(`从 E 站 tag group 工具加载了 ${tags.length} 个标签`);
    return tags;
}
