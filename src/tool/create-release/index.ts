import { Database } from '../../shared/database';
import fs from 'fs-extra';
import { gzip } from 'pako';
import { TagType } from '../../shared/interfaces/ehtag';
import path from 'path';
import { promisify } from 'util';
import pako from './pako';
import { program } from 'commander';
import { action } from 'tool/utils';

async function logFile(file: string): Promise<void> {
    console.log(`Created: ${file} (${(await fs.stat(file)).size} bytes)`);
}

async function save(data: unknown, type: TagType): Promise<void> {
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
    await db.load();
    for (const k of ['full', 'raw', 'text', 'html', 'ast'] as const) {
        const data = await db.render(k);
        await save(data, k);
    }
    action.isAction() ? action.endGroup() : console.log(``);
    await db.save();
    process.chdir(old);
}

program
    .command('create-release [source] [destination]')
    .description('Create database release assets.')
    .action(async (source?: string, destination?: string) => {
        source = path.resolve(source ?? '.');
        destination = path.resolve(destination ?? path.join(source, 'publish'));
        const db = await Database.create(source);
        await createRelease(db, destination);
    });
