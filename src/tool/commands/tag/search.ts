import clc from 'cli-color';
import { suggestTag } from '../../../shared/ehentai';
import { command, parseTag, formatTag } from './command';

command
    .command('search <[namespace:]tag>')
    .description('搜索标签')
    .action(async (tag: string) => {
        const [namespace, raw] = parseTag(tag);
        const result = await suggestTag(namespace, raw);
        if (result.length === 0) {
            console.error('未找到相应标签');
        } else {
            result.forEach((tag) => {
                if (tag.master) {
                    console.log(`${formatTag(tag, raw)} ${clc.blackBright('=>')} ${formatTag(tag.master, raw)}`);
                } else {
                    console.log(formatTag(tag, raw));
                }
            });
        }
    });
