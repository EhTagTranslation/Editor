import { program } from 'commander';
import { NamespaceName } from '../../../shared/interfaces/ehtag';
import { RawTag } from '../../../shared/validate';
export { Command } from 'commander';

export const command = program.command('tag').description('用于处理标签的相关工具');

export function parseTag(tag: string): [NamespaceName | undefined, RawTag] {
    tag = (tag ?? '').trim();
    let ns: string | undefined;
    if (tag.includes(':')) {
        [ns, tag] = tag.split(':');
    }
    const namespace = (ns?.toLowerCase() ?? 'misc') as NamespaceName;
    if (!NamespaceName.includes(namespace)) throw new Error('无效的命名空间名称');
    const raw = RawTag(tag);
    if (!raw) throw new Error('无效的标签名称');
    return [ns ? namespace : undefined, raw];
}
