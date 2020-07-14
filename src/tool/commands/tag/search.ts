import { suggestTag } from '../../../shared/ehentai';
import { RawTag } from '../../../shared/validate';
import { NamespaceName } from '../../../shared/interfaces/ehtag';
import { command } from './command';

command.command('search <[namespace:]tag>').action(async (tag: string) => {
    tag = (tag ?? '').trim();
    let ns: string | undefined;
    if (tag.includes(':')) {
        [ns, tag] = tag.split(':');
    }
    const namespace = (ns?.toLowerCase() ?? 'misc') as NamespaceName;
    if (!NamespaceName.includes(namespace)) throw new Error('无效的命名空间名称');
    const raw = RawTag(tag);
    if (!raw) throw new Error('无效的标签名称');
    const result = await suggestTag(ns ? namespace : undefined, raw);
    if (result.length === 0) {
        console.error('未找到相应标签');
    } else {
        result.forEach((tag) => {
            if (tag.master) {
                console.log(`${tag.namespace}:${tag.raw} => ${tag.master.namespace}:${tag.master.raw}`);
            } else {
                console.log(`${tag.namespace}:${tag.raw}`);
            }
        });
    }
});
