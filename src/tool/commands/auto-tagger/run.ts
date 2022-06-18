import { Option, OptionValues } from 'commander';
import path from 'path';
import { Context } from '../../../shared/markdown/index.js';
import { Database } from '../../../shared/database.js';
import { getTagGroups } from '../../../shared/ehentai/index.js';
import { NamespaceName } from '../../../shared/interfaces/ehtag.js';
import { isRawTag, RawTag } from '../../../shared/raw-tag.js';
import { isNamespaceName } from '../../../shared/namespace.js';
import { command } from './command.js';
import { translate } from './translate.js';

async function run(db: Database, namespace?: NamespaceName, fromTag?: RawTag, signal?: AbortSignal): Promise<void> {
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
        if (namespace && tag.namespace !== namespace) {
            continue;
        }
        if (fromTag && tag.raw < fromTag) {
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
            if (signal?.aborted) {
                console.error(`终止执行`);
                return;
            }
        } catch (ex) {
            db.logger.warn(new Context(nsDb, tag.raw), (ex as Error).message);
        }
    }
}

command
    .command('run')
    .description('自动查找并补充缺失的标签')
    .argument('[source]', 'REPO 的本地路径')
    .addOption(new Option('--namespace [ns]', '进行翻译的命名空间').choices(NamespaceName))
    .option('--from [tag]', '从指定标签开始查找')
    .action(async (source: string | undefined, options: OptionValues) => {
        source = path.resolve(source ?? '.');
        const { namespace, from } = options as Record<string, string | undefined>;
        if (namespace != null && !isNamespaceName(namespace)) {
            console.error(`${namespace} 不是有效的命名空间`);
            process.exitCode = 2;
            return;
        }
        if (from != null && !isRawTag(from)) {
            console.error(`${from} 不是有效的标签`);
            process.exitCode = 2;
            return;
        }
        const db = await Database.create(source);
        const abortController = new AbortController();
        process.on('SIGINT', () => {
            if (!abortController.signal.aborted) {
                abortController.abort();
                console.error(`发送终止信号…`);
            }
        });
        try {
            await run(db, namespace, from, abortController.signal);
        } catch (ex) {
            console.error((ex as Error).message);
            process.exitCode = 1;
        }
        try {
            await db.save();
            console.log(`保存数据库成功`);
        } catch (ex) {
            console.error((ex as Error).message);
            process.exitCode = 1;
        }

        if (abortController.signal.aborted) {
            process.exitCode = 1;
        }
    });
