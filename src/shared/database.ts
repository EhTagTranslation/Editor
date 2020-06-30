import * as fs from 'fs-extra';
import * as path from 'path';
import simpleGit, { SimpleGit } from 'simple-git';
import { NamespaceDatabase } from './namespace-database';
import { NamespaceName, RepoInfo, Sha1Value, RepoData, TagType } from './interfaces/ehtag';
import { TagRecord } from './tag-record';
import { RawTag } from './validate';
import { DatabaseView } from './interfaces/database';

const SUPPORTED_REPO_VERSION = 5;

export class Database implements DatabaseView {
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

        const git = (await fs.pathExists(path.join(repoPath, '.git'))) ? simpleGit({ baseDir: repoPath }) : undefined;
        const db = new Database(repoPath, version, files, git);
        await db.load();
        return db;
    }

    private constructor(
        readonly repoPath: string,
        readonly version: number,
        files: readonly string[],
        private readonly git?: SimpleGit,
    ) {
        this.data = NamespaceName.reduce((obj, v, i) => {
            obj[v] = new NamespaceDatabase(v, files[i], this);
            return obj;
        }, {} as { [key in NamespaceName]: NamespaceDatabase });
    }
    readonly data: { readonly [key in NamespaceName]: NamespaceDatabase };

    async load(): Promise<void> {
        await Promise.all(Object.values(this.data).map((n) => n.load()));
    }
    async save(): Promise<void> {
        await Promise.all(Object.values(this.data).map((n) => n.save()));
    }

    async sha(): Promise<Sha1Value> {
        return (await this.headInfo()).sha;
    }

    private async headInfo(): Promise<RepoInfo['head']> {
        if (!this.git) throw new Error('This is not a git repo');
        const commit = (
            await this.git.log({
                from: 'HEAD^',
                to: 'HEAD',
                format: {
                    sha: '%H',
                    message: '%B',
                    'author.name': '%an',
                    'author.email': '%ae',
                    'author.when': '%aI',
                    'committer.name': '%cn',
                    'committer.email': '%ce',
                    'committer.when': '%cI',
                },
            })
        ).latest;
        return {
            sha: commit.sha as Sha1Value,
            message: commit.message,
            author: {
                name: commit['author.name'],
                email: commit['author.email'],
                when: new Date(commit['author.when']),
            },
            committer: {
                name: commit['committer.name'],
                email: commit['committer.email'],
                when: new Date(commit['committer.when']),
            },
        };
    }

    private async repoInfo(): Promise<Omit<RepoInfo, 'data'>> {
        if (!this.git) throw new Error('This is not a git repo');
        const remote = await this.git.getRemotes(true);
        const url = new URL(remote[0].refs.fetch);
        url.username = '';
        url.password = '';
        return {
            repo: url.href,
            head: await this.headInfo(),
            version: this.version,
        };
    }

    async info(): Promise<RepoInfo> {
        return {
            ...(await this.repoInfo()),
            data: Object.values(this.data).map((ns) => ns.info()),
        };
    }

    async render<T extends TagType>(type: T): Promise<RepoData<T>> {
        return {
            ...(await this.repoInfo()),
            data: Object.values(this.data).map((ns) => ns.render(type)),
        };
    }

    get(raw: RawTag): TagRecord | undefined {
        for (const ns of NamespaceName) {
            const record = this.data[ns].get(raw);
            if (record) return record;
        }
        return undefined;
    }

    revision = 1;
}
