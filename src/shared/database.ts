import fs from 'fs-extra';
import path from 'path';
import simpleGit from 'simple-git';
import { NamespaceDatabase } from './namespace-database';
import { NamespaceName, RepoInfo, Sha1Value, RepoData, TagType } from './interfaces/ehtag';
import { TagRecord } from './tag-record';
import { RawTag } from './validate';
import { DatabaseView } from './interfaces/database';
import { Logger } from './markdown';

const SUPPORTED_REPO_VERSION = 5;

export interface RepoInfoProvider {
    head(): Promise<RepoInfo['head']> | RepoInfo['head'];

    repo(): Promise<RepoInfo['repo']> | RepoInfo['repo'];
}

class GitRepoInfoProvider implements RepoInfoProvider {
    constructor(readonly repoPath: string) {}
    private readonly git = simpleGit({ baseDir: this.repoPath });
    async head(): Promise<RepoInfo['head']> {
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

    async repo(): Promise<RepoInfo['repo']> {
        const remote = await this.git.getRemotes(true);
        return remote[0].refs.fetch;
    }
}

export class Database implements DatabaseView {
    static async create(repoPath: string, repoInfoProvider?: RepoInfoProvider): Promise<Database> {
        repoPath = path.resolve(repoPath);

        await fs.access(path.join(repoPath, 'version'));
        const version = Number.parseFloat((await fs.readFile(path.join(repoPath, 'version'), 'utf-8')).trim());
        if (Number.isNaN(version) || version < SUPPORTED_REPO_VERSION || version >= SUPPORTED_REPO_VERSION + 1) {
            throw new Error('version not supported');
        }

        await fs.access(path.join(repoPath, 'database'));
        const files = NamespaceName.map((ns) => path.join(repoPath, 'database', `${ns}.md`));
        await Promise.all(files.map((f) => fs.access(f)));

        const info =
            repoInfoProvider ??
            ((await fs.pathExists(path.join(repoPath, '.git'))) ? new GitRepoInfoProvider(repoPath) : undefined);
        const db = new Database(repoPath, version, files, info);
        await db.load();
        return db;
    }

    private constructor(
        readonly repoPath: string,
        readonly version: number,
        files: readonly string[],
        private readonly repoInfoProvider?: RepoInfoProvider,
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
        if (!this.repoInfoProvider) throw new Error('This is not a git repo');
        return (await this.repoInfoProvider.head()).sha;
    }

    private async repoInfo(): Promise<Omit<RepoInfo, 'data'>> {
        if (!this.repoInfoProvider) throw new Error('This is not a git repo');
        const head = this.repoInfoProvider.head();
        let repo = await this.repoInfoProvider.repo();
        if (/^https?:\/\//.test(repo)) {
            const url = new URL(repo);
            url.username = '';
            url.password = '';
            repo = url.href;
        } else if (/^git@/.test(repo)) {
            const match = /^git@([^:]+):(.+)$/.exec(repo);
            if (match) {
                const [_, host, path] = match;
                repo = `https://${host}/${path}`;
            }
        }
        return {
            repo,
            head: await head,
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

    logger = Logger.default;
}
