import { program } from 'commander';
import { parseTag } from '../tag/command';
import { searchTag } from './lib/search-tag';

const command = program.command('auto-tagger').description('自动添加标签翻译');

command
    .command('translate')
    .description('翻译标签')
    .argument('tag', '要翻译的标签')
    .action(async (tag: string) => {
        const [ns, raw] = parseTag(tag);
        if (!ns) throw new Error('标签必须包含命名空间');
        for (const g of await searchTag(ns, raw)) {
            console.log(g);
        }
    });
