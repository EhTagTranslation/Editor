import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';
import fs from 'fs-extra';
import type { Database } from '#shared/database';
import { type RepoData, TagType } from '#shared/interfaces/ehtag';
import { action } from '../../utils.js';

async function gzip(data: string): Promise<Buffer> {
    return new Promise((resolve, reject) =>
        zlib.gzip(
            data,
            {
                level: zlib.constants.Z_MAX_LEVEL,
                memLevel: zlib.constants.Z_MAX_MEMLEVEL,
                windowBits: zlib.constants.Z_MAX_WINDOWBITS,
                info: false,
            },
            (error, result) => {
                if (error) reject(error);
                else resolve(result);
            },
        ),
    );
}

async function write(filename: string, data: Buffer | string): Promise<void> {
    if (typeof data == 'string') data = Buffer.from(data);
    await fs.writeFile(filename, data);
    console.log(`Created: ${filename} (${data.byteLength} bytes)`);
}
const jsonpTemplateLoader = fs.readFile(path.resolve(fileURLToPath(import.meta.url), '../flate.js'), 'utf-8');

async function save(data: RepoData<unknown>, type: TagType): Promise<void> {
    const json = JSON.stringify(data);
    const writeJson = write(`db.${type}.json`, json);

    const gz = await gzip(json);
    const writeGz = write(`db.${type}.json.gz`, gz);

    const jsonpTemplate = await jsonpTemplateLoader;
    const jsonp = jsonpTemplate
        .replace('__EH_TOOL_RELEASE_DATA__', gz.toString('base64'))
        .replace('__EH_TOOL_RELEASE_CALLBACK__', `"load_ehtagtranslation_db_${type}"`);
    const writeJsonp = write(`db.${type}.js`, jsonp);

    await Promise.all([writeJson, writeGz, writeJsonp]);
}
export async function createRelease(db: Database, destination: string): Promise<void> {
    console.log('Building releases...');
    console.log(`  Source: ${db.repoPath}`);
    console.log(`  Destination: ${destination}`);

    const data = await db.renderAll();

    const old = process.cwd();
    await fs.ensureDir(destination);
    process.chdir(destination);
    action.isAction() ? action.startGroup('files') : console.log(``);
    await Promise.all(TagType.map((k) => save(data.get(k) as RepoData, k)));
    action.isAction() ? action.endGroup() : console.log(``);
    process.chdir(old);
}
