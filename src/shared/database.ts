import fs from 'fs-extra';
import path from 'path';
import { NamespaceDatabase } from './namespace-database';
import { NamespaceName, RepoInfo, Sha1Value, RepoData, TagType } from './interfaces/ehtag';
import type { TagRecord } from './tag-record';
import type { RawTag } from './raw-tag';
import type { DatabaseView } from './interfaces/database';
import { Logger } from './markdown';
import { GitRepoInfoProvider, RepoInfoProvider } from './repo-info-provider';

const SUPPORTED_REPO_VERSION = 6;
export class Database implements DatabaseView {
    static async create(repoPath: string, repoInfoProvider?: RepoInfoProvider, logger?: Logger): Promise<Database> {
        const resolvedPath = path.resolve(repoPath);

        const versionPath = path.join(resolvedPath, 'version');
        const versionData = await fs.readFile(versionPath, 'utf-8').catch((err: unknown) => {
            throw new Error(
                `无法访问 "${path.join(repoPath, 'version')}"，"${repoPath}" 可能不是一个有效的数据库\n${String(err)}`,
            );
        });
        const version = Number.parseFloat(versionData.trim());
        if (Number.isNaN(version) || version < SUPPORTED_REPO_VERSION || version >= SUPPORTED_REPO_VERSION + 1) {
            throw new Error(`不支持的数据库版本 ${versionData}，当前支持版本 ${SUPPORTED_REPO_VERSION}`);
        }

        await fs.access(path.join(resolvedPath, 'database')).catch((err: unknown) => {
            throw new Error(
                `无法访问 "${path.join(repoPath, 'database')}"，"${repoPath}" 可能不是一个有效的数据库\n${String(err)}`,
            );
        });
        const files = NamespaceName.map((ns) => [ns, path.join(resolvedPath, 'database', `${ns}.md`)] as const);
        await Promise.all(
            files.map(async ([ns, file]) => {
                try {
                    await fs.access(file);
                } catch (e) {
                    const p = path.join(repoPath, 'database', `${ns}.md`);
                    throw new Error(`无法访问 "${p}"，"${repoPath}" 可能不是一个有效的数据库\n${String(e)}`);
                }
            }),
        );

        const info =
            repoInfoProvider ??
            ((await fs.pathExists(path.join(repoPath, '.git'))) ? new GitRepoInfoProvider(repoPath) : undefined);
        const db = new Database(repoPath, version, files, info);
        if (logger) db.logger = logger;
        await db.load();
        return db;
    }

    private constructor(
        readonly repoPath: string,
        readonly version: number,
        files: ReadonlyArray<readonly [NamespaceName, string]>,
        private readonly repoInfoProvider?: RepoInfoProvider,
    ) {
        const data = {} as { [key in NamespaceName]: NamespaceDatabase };
        for (const [ns, file] of files) {
            data[ns] = new NamespaceDatabase(ns, file, this);
        }
        this.data = data;
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
