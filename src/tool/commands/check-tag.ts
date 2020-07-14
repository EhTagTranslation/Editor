import { program } from 'commander';
import { normalizeTag } from '../../shared/ehentai';
import { RawTag } from '../../shared/validate';
import { NamespaceName } from '../../shared/interfaces/ehtag';

program.command('check-tag  <[namespace:]tag>').action(async (tag: string) => {
    tag = (tag ?? '').trim();
    let ns: string | undefined;
    if (tag.includes(':')) {
        [ns, tag] = tag.split(':');
    }
    const namespace = (ns?.toLowerCase() ?? 'misc') as NamespaceName;
    if (!NamespaceName.includes(namespace)) throw new Error('无效的命名空间名称');
    const raw = RawTag(tag);
    if (!raw) throw new Error('无效的标签名称');
    const result = await normalizeTag(ns ? namespace : undefined, raw);
    if (!result) {
        console.error('未找到相应标签');
    } else {
        console.log(`找到标签：'${result[0]}:${result[1]}'`);
    }
});
