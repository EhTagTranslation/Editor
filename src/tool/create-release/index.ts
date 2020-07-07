import { program, Command } from 'commander';
import fs from 'fs-extra';
import { gzip } from 'pako';
import path from 'path';
import { promisify } from 'util';
import { TagType, RepoData } from '../../shared/interfaces/ehtag';
import { Database } from '../../shared/database';
import pako from './pako';
import { action } from '../utils';
import { Logger, Context } from '../../shared/markdown';

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
    const write = promisify(jsonp.write.bind(jsonp));
    await write(`(function(){var d={c:'load_ehtagtranslation_db_${type}',d:'`);
    await write(Buffer.from(gz).toString('base64'));
    await write(`'};`);
    await write(pako);
    await write('})();');
    await promisify(jsonp.end.bind(jsonp))();
    await logFile(`db.${type}.js`);
}

async function createRelease(db: Database, destination: string): Promise<void> {
    const old = process.cwd();
    console.log('Building releases...');
    console.log(`  Source: ${db.repoPath}`);
    console.log(`  Destination: ${destination}`);
    action.isAction() ? action.startGroup('files') : console.log(``);
    await fs.ensureDir(destination);
    process.chdir(destination);
    const types = ['full', 'raw', 'text', 'html', 'ast'] as const;
    const data = {} as Record<typeof types[number], RepoData<unknown>>;
    for (const k of types) {
        data[k] = await db.render(k);
    }
    for (const k of types) {
        await save(data[k], k);
    }
    action.isAction() ? action.endGroup() : console.log(``);
    process.chdir(old);
}

class ActionLogger extends Logger {
    readonly map: Record<keyof Logger, 'info' | 'warning' | 'error' | 'setFailed'> = {
        info: 'info',
        warn: 'warning',
        error: 'error',
    };
    protected log(logger: 'info' | 'warn' | 'error', context: Context, message: string): void {
        action[this.map[logger]](`${context.namespace.name}:${context.raw ?? '<unknown raw>'}: ${message}`);
    }

    constructor(readonly failed: keyof Logger = 'error') {
        super();
        switch (failed) {
            case 'info':
                this.map.info = 'setFailed';
            // fall through
            case 'warn':
                this.map.warn = 'setFailed';
            // fall through
            case 'error':
                this.map.error = 'setFailed';
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
    .option('--no-rewrite', '不重新序列化数据库内容')
    .action(async (source: string | undefined, destination: string | undefined, command: Command) => {
        source = path.resolve(source ?? '.');
        destination = path.resolve(destination ?? path.join(source, 'publish'));
        const db = await Database.create(source);
        const { strict, rewrite } = command.opts();
        if (action.isAction()) {
            db.logger = new ActionLogger(strict ? 'warn' : 'error');
        }
        await createRelease(db, destination);
        if (rewrite) {
            await db.save();
        }
    });
