import { suggestTag, Tag } from '../../../shared/ehentai';
import { command, parseTag } from './command';
import clc from 'cli-color';
import escapeRegexp from 'escape-string-regexp';

function formatTag(tag: Tag, term?: string): string {
    let raw: string = tag.raw;
    if (term) {
        const reg = new RegExp(escapeRegexp(term), 'gi');
        raw = raw.replace(reg, clc.bold(term));
    }
    return `${clc.green(tag.namespace)}:${raw}`;
}

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
