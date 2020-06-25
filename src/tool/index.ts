import 'source-map-support/register';
import { Database } from '../shared/database';

async function main(): Promise<void> {
    const db = await Database.create('db');
    await db.load();
    await db.save();
}

void main();
