import { program, OptionValues } from 'commander';
import fs from 'fs-extra';
import { gzip } from 'pako';
import path from 'path';
import { promisify } from 'util';
import { TagType, RepoData, NamespaceName } from '../../../shared/interfaces/ehtag';
import { Database } from '../../../shared/database';
import pako from './pako';
import { action } from '../../utils';
import { Logger, Context } from '../../../shared/markdown';
import { normalizeTag } from '../../../shared/ehentai';
import { RawTag } from '../../../shared/validate';

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

async function runSourceCheck(db: Database): Promise<void> {
    console.log('Checking tags from source...\n');
    for (const k in db.data) {
        const ns = k as NamespaceName;
        if (ns === 'rows') continue;
        const nsDb = db.data[ns];
        const tags = nsDb.render('raw').data;
        for (const t in tags) {
            const tag = t as RawTag;
            const record = nsDb.get(tag);
            if (!record) throw new Error();
            const normTag = await normalizeTag(ns, tag);
            if (normTag == null) {
                db.logger.warn(new Context(record, tag), 'Tag not found');
            } else if (normTag[1] !== tag) {
                db.logger.warn(new Context(record, tag), `Tag renamed: => ${normTag[0]}:${normTag[1]}`);
            }
        }
    }
    console.log(' ');
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
    .command('create-release [source] [destination]')
    .description('生成发布文件', {
        source: 'REPO 的本地路径',
        destination: '生成发布文件的路径',
    })
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
        if (sourceCheck) {
            await runSourceCheck(db);
        }
        await createRelease(db, destination);
        if (rewrite) {
            await db.save();
        }
    });
