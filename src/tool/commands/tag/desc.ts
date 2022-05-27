import { normalizeTag } from '../../../shared/ehentai';
import { command, parseTag } from './command';
import axios, { AxiosError } from 'axios';
import type { Tag } from '../../../shared/interfaces/ehtag';

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
            const info = await axios.get<Tag<'raw'>>(
                `https://ehtt.herokuapp.com/database/${result[0]}/${result[1]}?format=raw.json`,
            );
            console.log(`原始标签：${result[0]}:${result[1]}`);
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
