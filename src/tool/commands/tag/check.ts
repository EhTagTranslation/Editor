import { normalizeTag } from '../../../shared/ehentai';
import { command, parseTag } from './command';

command.command('check <[namespace:]tag>').action(async (tag: string) => {
    const [namespace, raw] = parseTag(tag);
    const result = await normalizeTag(namespace, raw);
    if (!result) {
        console.error('未找到相应标签');
        process.exit(1);
    }
    console.log(`${result[0]}:${result[1]}`);
});
