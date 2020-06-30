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

export interface Context {
    database: DatabaseView;
    namespace: NamespaceDatabaseView;
    raw?: RawTag;
    normalized?: boolean;
}

class ContextStatic {
    create(tag: TagRecord, raw?: RawTag): Context;
    create(namespace: NamespaceDatabaseView, raw?: RawTag): Context;
    create(root: TagRecord | NamespaceDatabaseView, raw?: RawTag): Context {
        const namespace = root instanceof TagRecord ? root.namespace : root;
        return {
            database: namespace.database,
            namespace,
            raw,
        };
    }
}

export const Context = new ContextStatic();
