import { RepoInfo, TagType, RepoData, NamespaceName, FrontMatters, NamespaceInfo, NamespaceData } from './ehtag';
import { RawTag } from '../validate';
import { TagRecord } from '../tag-record';

export interface NamespaceDatabaseView {
    readonly namespace: NamespaceName;
    readonly database: DatabaseView;
    readonly frontMatters: Readonly<FrontMatters>;

    info(): NamespaceInfo;

    render<T extends TagType>(type: T): NamespaceData<T>;

    readonly size: number;

    get(raw: RawTag): TagRecord | undefined;

    has(raw: RawTag): boolean;
}

export interface DatabaseView {
    readonly version: number;
    readonly data: { readonly [key in NamespaceName]: NamespaceDatabaseView };

    info(): Promise<RepoInfo>;

    render<T extends TagType>(type: T): Promise<RepoData<T>>;

    get(raw: RawTag): TagRecord | undefined;

    revision: number;
}

export class Context {
    constructor(tag: TagRecord, raw?: RawTag);
    constructor(namespace: NamespaceDatabaseView, raw?: RawTag);
    constructor(root: TagRecord | NamespaceDatabaseView, raw?: RawTag) {
        const namespace = root instanceof TagRecord ? root.namespace : root;
        this.database = namespace.database;
        this.namespace = namespace;
        this.raw = raw;
    }
    database: DatabaseView;
    namespace: NamespaceDatabaseView;
    raw?: RawTag;
}
