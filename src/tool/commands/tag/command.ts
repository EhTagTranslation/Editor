import { program } from 'commander';
import { NamespaceName } from '../../../shared/interfaces/ehtag';
import { RawTag } from '../../../shared/validate';
import { parseTag as parseTagRaw } from '../../../shared/ehentai';
export { Command } from 'commander';

export const command = program.command('tag').description('用于处理标签的相关工具');

export function parseTag(tag: string): [NamespaceName | undefined, RawTag] {
    const r = parseTagRaw(tag);
    if (!r.valid) throw new Error('无效的标签');
    return [r.ns, r.raw];
}
