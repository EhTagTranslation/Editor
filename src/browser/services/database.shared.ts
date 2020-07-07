import {
    Sha1Value,
    TagType,
    NamespaceData,
    NamespaceInfo,
    NamespaceName,
    FrontMatters,
    RepoData,
    RepoInfo,
} from 'shared/interfaces/ehtag';
import { DatabaseView, NamespaceDatabaseView } from 'shared/interfaces/database';
import { Context } from 'shared/markdown';
import { RawTag } from 'shared/validate';
import { TagRecord } from 'shared/tag-record';

const fallback: Record<NamespaceName, Omit<FrontMatters, 'key'>> = {
    rows: { name: '行名', description: '标签列表的行名，即标签的命名空间。' },
    artist: { name: '艺术家', description: '绘画作者 / Coser。' },
    female: { name: '女性', description: '女性角色相关的恋物标签。' },
    male: { name: '男性', description: '男性角色相关的恋物标签。' },
    parody: { name: '原作', description: '同人作品模仿的原始作品。' },
    character: { name: '角色', description: '作品中出现的角色。' },
    group: { name: '团队', description: '制作社团或公司。' },
    language: { name: '语言', description: '作品的语言。' },
    reclass: {
        name: '重新分类',
        description: '用于分类出错的画廊，当某个重新分类标签权重达到 100，将移动画廊至对应分类。',
    },
    misc: {
        name: '杂项',
        description:
            '两性/中性的恋物标签或没有具体分类的标签，可以在论坛发帖请求管理员添加新的标签或将标签移动到正确分类。',
    },
};

const info = {
    repo: 'https://github.com/EhTagTranslation/Database.git',
    version: 5,
    head: {
        sha: '000000000000000000000000000' as Sha1Value,
        message: '',
        author: {
            name: 'author',
            email: 'author@example.com',
            when: new Date(0),
        },
        committer: {
            name: 'committer',
            email: 'committer@example.com',
            when: new Date(0),
        },
    },
};

export class NamespaceDatabaseInMemory implements NamespaceDatabaseView {
    constructor(
        readonly database: DatabaseView,
        readonly name: NamespaceName,
        protected readonly storage?: NamespaceData<'raw'>,
    ) {}

    get frontMatters(): Readonly<FrontMatters> {
        return { ...(this.storage?.frontMatters ?? fallback[this.name]), key: this.name };
    }
    info(): NamespaceInfo {
        return {
            namespace: this.name,
            count: this.storage?.count ?? 0,
            frontMatters: this.frontMatters,
        };
    }
    render<T extends TagType>(type: T): NamespaceData<T> {
        if (!this.storage) {
            return {
                ...this.info(),
                data: {},
            };
        }
        if (type === 'raw') {
            return this.storage as NamespaceData<T>;
        }
        const data = {} as NamespaceData<T>['data'];
        const context = new Context(this);
        for (const k in this.storage.data) {
            const key = k as RawTag;
            const tag = this.get(key);
            if (tag) {
                context.raw = key;
                data[key] = tag.render(type, context);
            }
        }
        return {
            ...this.info(),
            data,
        };
    }
    get size(): number {
        return this.storage?.count ?? 0;
    }
    get(raw: RawTag): TagRecord | undefined {
        const tag = this.storage?.data[raw];
        if (!tag) return undefined;
        return new TagRecord(tag, this);
    }
    has(raw: RawTag): boolean {
        const tag = this.storage?.data[raw];
        return !!tag;
    }
    get valid(): boolean {
        return this.storage != null;
    }
}

export class DatabaseInMemory implements DatabaseView {
    constructor(protected readonly storage?: RepoData<'raw'>, revision?: number) {
        this.revision = revision ?? -1;
        const data = {} as { [key in NamespaceName]: NamespaceDatabaseInMemory };
        for (const key of NamespaceName) {
            data[key] = new NamespaceDatabaseInMemory(
                this,
                key,
                storage?.data.find((d) => d.namespace === key),
            );
        }
        this.data = data;
    }
    get version(): number {
        return this.storage?.version ?? 5;
    }
    readonly data: { readonly [key in NamespaceName]: NamespaceDatabaseInMemory };

    info(): Promise<RepoInfo> {
        return Promise.resolve({ ...(this.storage ?? info), data: Object.values(this.data).map((d) => d.info()) });
    }

    async render<T extends TagType>(type: T): Promise<RepoData<T>> {
        const info = await this.info();
        const data = Object.values(this.data).map((d) => d.render(type));
        const result = {
            ...info,
            data,
        };
        return result;
    }

    get(raw: RawTag): TagRecord | undefined {
        for (const ns of NamespaceName) {
            const record = this.data[ns].get(raw);
            if (record) return record;
        }
        return undefined;
    }

    revision!: number;
    get valid(): boolean {
        return this.storage != null;
    }
}
