import { NamespaceName } from '../../../shared/interfaces/ehtag.js';
import { normalizeTag } from '../../../shared/ehentai/index.js';
import type { RawTag } from '../../../shared/raw-tag.js';
import { command, parseTag, formatTag } from './command.js';

function print(tag: [NamespaceName, RawTag]): void {
    console.log(
        formatTag({
            namespace: tag[0],
            raw: tag[1],
        }),
    );
}

command
    .command('check <[namespace:]tag>')
    .description('检查标签是否存在，并找到对应主标签')
    .action(async (tag: string) => {
        const [namespace, raw] = parseTag(tag);
        let found = false;
        if (namespace == null) {
            const result = await normalizeTag(undefined, raw);
            if (result) {
                print(result);
                found = true;
            } else {
                for (const ns of NamespaceName) {
                    const result = await normalizeTag(ns, raw);
                    if (result) {
                        print(result);
                        found = true;
                    }
                }
            }
        } else {
            const result = await normalizeTag(namespace, raw);
            if (result) {
                print(result);
                found = true;
            }
        }
        if (!found) {
            console.error('未找到相应标签');
            process.exitCode = 1;
        }
    });
