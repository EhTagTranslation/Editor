import 'source-map-support/register';
import { Database } from '../shared/database';
import { createRelease } from './create-release';
import * as path from 'path';
import { program } from 'commander';

const checkPath = (p: string): string => {
    return path.resolve(p);
};
program
    .version('0.0.1')
    .option('--source <source>', 'Source folder of database, root of the git repo', checkPath, '.')
    .option('--target <target>', 'Target folder of generated files', checkPath, './publish')
    .parse();
const opt = program.opts() as {
    source: string;
    target: string;
};
console.log(opt);
async function main(): Promise<void> {
    const db = await Database.create(opt.source);
    await createRelease(db, opt.target);
}

void main();
