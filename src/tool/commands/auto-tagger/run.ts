import type { OptionValues } from 'commander';
import path from 'path';
import { Context } from '../../../shared/markdown';
import { Database } from '../../../shared/database';
import { getTagGroups } from '../../../shared/ehentai';
import type { NamespaceName } from '../../../shared/interfaces/ehtag';
import type { RawTag } from '../../../shared/raw-tag';
import { command } from './command';
import { translate } from './translate';

async function run(db: Database): Promise<void> {
    const tagFromEh = await getTagGroups();
    console.log(`从 tag group 工具预加载了 ${tagFromEh.length} 个标签`);
    const tagFromEtt = new Set<`${NamespaceName}:${RawTag}`>();
    for (const k in db.data) {
        const ns = k as NamespaceName;
        if (ns === 'rows') continue;
        const nsDb = db.data[ns];
        for (const [tag] of nsDb.raw()) {
            tagFromEtt.add(`${ns}:${tag}`);
        }
    }
    console.log(`从数据库加载了 ${tagFromEtt.size} 个标签`);
    for (const tag of tagFromEh) {
        if (tag.namespace !== 'parody') {
            continue;
        }
        if (tagFromEtt.has(`${tag.namespace}:${tag.raw}`)) {
            continue;
        }
        const nsDb = db.data[tag.namespace];
        try {
            console.log(`--------${tag.namespace}:${tag.raw}--------`);
            const translated = await translate(tag.namespace, tag.raw);
            const added = nsDb.add(tag.raw, translated);
            db.logger.info(new Context(added, tag.raw), `添加了标签：${translated.name}`);
        } catch (ex) {
            db.logger.warn(new Context(nsDb, tag.raw), (ex as Error).message);
        }
    }
}

command
    .command('run')
    .description('自动查找并补充缺失的标签')
    .argument('[source]', 'REPO 的本地路径')
    .action(async (source: string | undefined, _options: OptionValues) => {
        source = path.resolve(source ?? '.');
        const db = await Database.create(source);
        process.on('SIGINT', () => {
            db.save()
                .then(() => console.log(`保存数据库成功`))
                .catch((ex: Error) => console.error(ex))
                .finally(() => process.exit(1));
        });
        await run(db);
    });
