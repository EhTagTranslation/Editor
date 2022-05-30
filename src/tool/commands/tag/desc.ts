import type { AxiosError } from 'axios';
import type { Tag } from '../../../shared/interfaces/ehtag';
import { normalizeTag } from '../../../shared/ehentai';
import { get } from '../../../shared/ehentai/http';
import { command, parseTag, formatTag } from './command';

command
    .command('desc <[namespace:]tag>')
    .description('查询数据库中标签信息')
    .action(async (tag: string) => {
        const [namespace, raw] = parseTag(tag);
        const result = await normalizeTag(namespace, raw);
        if (!result) {
            console.error('未找到相应标签');
            process.exitCode = 1;
            return;
        }
        try {
            const info = await get<Tag<'raw'>>(
                `https://ehtt.herokuapp.com/database/${result[0]}/${result[1]}?format=raw.json`,
            );
            console.log(`原始标签：${formatTag({ namespace: result[0], raw: result[1] })}`);
            console.log(`    名称：${info.data.name}`);
            console.log(`    描述：${info.data.intro}`);
            console.log(`外部链接：${info.data.links}`);
        } catch (err) {
            const ae = err as AxiosError;
            if (ae.response?.status === 404) {
                console.error(`未找到标签 ${result[0]}:${result[1]} 的翻译`);
                process.exitCode = 1;
                return;
            }
            console.error(err);
        }
    });
