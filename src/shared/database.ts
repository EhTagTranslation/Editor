import * as fs from 'fs-extra';
import * as path from 'path';
import * as execa from 'execa';
import * as _ from 'lodash';
import { NamespaceData } from './namespace-data';
import { NamespaceName } from './interfaces/ehtag';

const SUPPORTED_REPO_VERSION = 5;

export class Database {
    static async create(repoPath: string): Promise<Database> {
        repoPath = path.resolve(repoPath);

        await fs.access(path.join(repoPath, 'version'));
        const version = Number.parseFloat((await fs.readFile(path.join(repoPath, 'version'), 'utf-8')).trim());
        if (Number.isNaN(version) || version < SUPPORTED_REPO_VERSION || version >= SUPPORTED_REPO_VERSION + 1) {
            throw new Error('version not supported');
        }

        await fs.access(path.join(repoPath, 'database'));
        const files = NamespaceName.map((ns) => path.join(repoPath, 'database', `${ns}.md`));
        await Promise.all(files.map((f) => fs.access(f)));
        const data = NamespaceName.reduce((obj, v, i) => {
            obj[v] = new NamespaceData(v, files[i]);
            return obj;
        }, {} as { [key in NamespaceName]: NamespaceData });

        const db = new Database(repoPath, version, data);
        await db.load();
        return db;
    }

    private constructor(
        readonly repoPath: string,
        readonly version: number,
        readonly data: { readonly [key in NamespaceName]: NamespaceData },
    ) {}

    async load(): Promise<void> {
        await Promise.all(Object.values(this.data).map((n) => n.load()));
    }
    async save(): Promise<void> {
        await Promise.all(Object.values(this.data).map((n) => n.save()));
    }
}
