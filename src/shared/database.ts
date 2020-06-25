import * as fs from 'fs-extra';
import * as path from 'path';
import * as execa from 'execa';
import { NamespaceData } from './namespace-data';
import * as _ from 'lodash';
import { NamespaceName } from 'browser/interfaces/ehtag';

const SUPPORTED_REPO_VERSION = 5;

export class Database {
    static async create(repoPath: string): Promise<Database> {
        repoPath = path.resolve(repoPath);

        await fs.ensureFile(path.join(repoPath, 'version'));
        const version = Number.parseFloat((await fs.readFile(path.join(repoPath, 'version'), 'utf-8')).trim());
        if (Number.isNaN(version) || version < SUPPORTED_REPO_VERSION || version >= SUPPORTED_REPO_VERSION + 1) {
            throw new Error('version not supported');
        }

        await fs.ensureDir(path.join(repoPath, 'database'));
        const files = await fs.readdir(path.join(repoPath, 'database'));
        return new Database(
            repoPath,
            version,
            _(files)
                .filter((f) => f.endsWith('.md'))
                .map((f) => new NamespaceData(f))
                .value(),
        );
    }

    private constructor(
        readonly repoPath: string,
        readonly version: number,
        readonly namespaces: readonly NamespaceData[],
    ) {}

    data: { [key in NamespaceName]: NamespaceData };

    async load(): Promise<void> {
        await Promise.all(this.namespaces.map((n) => n.load()));
    }
    async save(): Promise<void> {
        await Promise.all(this.namespaces.map((n) => n.save()));
    }
}
