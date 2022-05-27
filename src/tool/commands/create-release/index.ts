import { program, OptionValues } from 'commander';
import fs from 'fs-extra';
import { gzip } from 'pako';
import path from 'path';
import { promisify } from 'util';
import type { TagType, RepoData, NamespaceName } from '../../../shared/interfaces/ehtag';
import { Database } from '../../../shared/database';
import pako from './pako';
import { action } from '../../utils';
import { Logger, Context } from '../../../shared/markdown';
import { normalizeTag, loadMasterTags } from '../../../shared/ehentai';
import type { RawTag } from '../../../shared/raw-tag';
import clc from 'cli-color';

async function logFile(file: string): Promise<void> {
    console.log(`Created: ${file} (${(await fs.stat(file)).size} bytes)`);
}

async function save(data: RepoData<unknown>, type: TagType): Promise<void> {
    const json = JSON.stringify(data);
    await fs.writeFile(`db.${type}.json`, json);
    await logFile(`db.${type}.json`);

    const gz = gzip(json);
    await fs.writeFile(`db.${type}.json.gz`, gz);
    await logFile(`db.${type}.json.gz`);

    const jsonp = fs.createWriteStream(`db.${type}.js`);
    const write = (data: string): Promise<void> => {
        return new Promise<void>((resolve, reject) => {
            jsonp.write(data, (error) => (error ? reject(error) : resolve()));
        });
    };
    await write(`(function(){var d={c:'load_ehtagtranslation_db_${type}',d:'`);
    await write(Buffer.from(gz).toString('base64'));
    await write(`'};`);
    await write(pako);
    await write('})();');
    await promisify(jsonp.end.bind(jsonp))();
    await logFile(`db.${type}.js`);
}

async function createRelease(db: Database, destination: string): Promise<void> {
    console.log('Building releases...');
    console.log(`  Source: ${db.repoPath}`);
    console.log(`  Destination: ${destination}`);

    const types = ['full', 'raw', 'text', 'html', 'ast'] as const;
    const data = {} as Record<typeof types[number], RepoData<unknown>>;
    for (const k of types) {
        data[k] = await db.render(k);
    }

    const old = process.cwd();
    await fs.ensureDir(destination);
    process.chdir(destination);
    action.isAction() ? action.startGroup('files') : console.log(``);
    for (const k of types) {
        await save(data[k], k);
    }
    action.isAction() ? action.endGroup() : console.log(``);
    process.chdir(old);
}

async function runSourceCheck(db: Database): Promise<boolean> {
    console.log('\nChecking tags from source...\n');
    const t = await loadMasterTags();
    console.log(`Preloaded ${t.length} tags from tag group tool.`);
    const size = Object.values(db.data).reduce((sum, ns) => sum + (ns.name === 'rows' ? 0 : ns.size), 0);
    const sizeWidth = Math.floor(Math.log10(size)) + 1;
    let count = 0;
    let ok = true;
    const showProgress = process.stderr.isTTY && clc.windowSize.width > 0;
    for (const k in db.data) {
        const ns = k as NamespaceName;
        if (ns === 'rows') continue;
        const nsDb = db.data[ns];
        const tags = nsDb.render('raw').data;
        for (const t in tags) {
            const tag = t as RawTag;
            const record = nsDb.get(tag);
            if (!record) throw new Error();

            count++;
            if (showProgress) {
                process.stderr.write(
                    `[${count.toString().padStart(sizeWidth)}/${size}] ${ns}:${tag}`.padEnd(clc.windowSize.width - 10) +
                        `${((count / size) * 100).toFixed(3)}%`,
                );
                process.stderr.write(clc.move.lineBegin);
            }

            const normTag = await normalizeTag(ns, tag, true);
            if (normTag == null) {
                if (tag.length <= 2) {
                    if (showProgress) {
                        process.stderr.write(``.padEnd(clc.windowSize.width - 1) + clc.move.lineBegin);
                    }
                    db.logger.info(new Context(record, tag), 'Tag is too short, you should check it manually.');
                    continue;
                }
                if (showProgress) {
                    process.stderr.write(``.padEnd(clc.windowSize.width - 1) + clc.move.lineBegin);
                }
                db.logger.warn(new Context(record, tag), 'Tag not found.');
                ok = false;
                continue;
            }
            if (normTag[1] !== tag) {
                if (showProgress) {
                    process.stderr.write(``.padEnd(clc.windowSize.width - 1) + clc.move.lineBegin);
                }
                db.logger.warn(new Context(record, tag), `Tag renamed: => ${normTag[0]}:${normTag[1]}`);
                ok = false;
                continue;
            }
        }
    }
    console.log(' ');
    return ok;
}

class ActionLogger extends Logger {
    readonly map: Record<keyof Logger, 'info' | 'warning' | 'error'> = {
        info: 'info',
        warn: 'warning',
        error: 'error',
    };
    protected log(logger: 'info' | 'warn' | 'error', context: Context, message: string): void {
        const l = context.line ? `,line=${context.line}` : '';
        const f = `file=database/${context.namespace.name}.md`;
        const m = Logger.buildMessage(logger, context, message);
        console.log(`::${this.map[logger]} ${f}${l}::${m}`);
        if (this.setFailed[logger]) {
            process.exitCode = action.ExitCode.Failure;
        }
    }
    readonly setFailed: Record<keyof Logger, boolean> = {
        info: false,
        warn: false,
        error: true,
    };

    constructor(readonly failed: keyof Logger = 'error') {
        super();
        switch (failed) {
            case 'info':
                this.setFailed.info = true;
            // fall through
            case 'warn':
                this.setFailed.warn = true;
            // fall through
            case 'error':
                this.setFailed.error = true;
        }
    }
}

program
    .command('create-release')
    .argument('[source]', 'REPO 的本地路径')
    .argument('[destination]', '生成发布文件的路径')
    .option('--strict', '启用严格检查')
    .option('--source-check', '检查 TAG 数据库，提示不存在的和重命名的标签')
    .option('--no-rewrite', '不重新序列化数据库内容')
    .action(async (source: string | undefined, destination: string | undefined, options: OptionValues) => {
        source = path.resolve(source ?? '.');
        destination = path.resolve(destination ?? path.join(source, 'publish'));
        const { strict, rewrite, sourceCheck } = options;
        const db = await Database.create(
            source,
            undefined,
            action.isAction() ? new ActionLogger(strict ? 'warn' : 'error') : undefined,
        );
        let sourceCheckOk = true;
        if (sourceCheck) {
            sourceCheckOk = await runSourceCheck(db);
        }
        await createRelease(db, destination);
        if (rewrite) {
            await db.save();
        }
        if (!sourceCheckOk) {
            process.exitCode = action.ExitCode.Failure;
        }
    });
