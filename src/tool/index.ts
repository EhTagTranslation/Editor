import 'source-map-support/register';
import { Database } from '../shared/database';
import * as fs from 'fs-extra';

async function main(): Promise<void> {
    const db = await Database.create('db');
    await db.load();
    await db.save();
    process.chdir(db.repoPath);
    await fs.mkdirp('publish');
    await fs.writeJSON('publish/db.full.json', await db.render('full'));
    await fs.writeJSON('publish/db.ast.json', await db.render('ast'));
    await fs.writeJSON('publish/db.html.json', await db.render('html'));
    await fs.writeJSON('publish/db.text.json', await db.render('text'));
    await fs.writeJSON('publish/db.raw.json', await db.render('raw'));
}

void main();
