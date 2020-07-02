import { Database } from '../shared/database';
import fs from 'fs-extra';
import { gzip } from 'pako';
import { TagType } from '../shared/interfaces/ehtag';
import path from 'path';
import { promisify } from 'util';
import pako from './pako';

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

export async function createRelease(db: Database, target: string): Promise<void> {
    target = path.resolve(target);
    const old = process.cwd();
    console.log('Building releases...');
    console.log(`  Source: ${db.repoPath}`);
    console.log(`  Target: ${target}`);
    await fs.mkdirp(target);
    process.chdir(target);
    await db.load();
    for (const k of ['full', 'raw', 'text', 'html', 'ast'] as const) {
        const data = await db.render(k);
        await save(data, k);
    }
    await db.save();
    process.chdir(old);
}
