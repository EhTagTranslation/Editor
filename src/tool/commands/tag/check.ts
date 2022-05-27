import { normalizeTag } from '../../../shared/ehentai';
import { command, parseTag, formatTag } from './command';

command
    .command('check <[namespace:]tag>')
    .description('检查标签是否存在，并找到对应主标签')
    .action(async (tag: string) => {
        const [namespace, raw] = parseTag(tag);
        const result = await normalizeTag(namespace, raw);
        if (!result) {
            console.error('未找到相应标签');
            process.exitCode = 1;
            return;
        }
        console.log(
            formatTag({
                namespace: result[0],
                raw: result[1],
            }),
        );
    });
