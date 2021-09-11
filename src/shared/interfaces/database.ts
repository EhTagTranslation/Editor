import type { RepoInfo, TagType, RepoData, NamespaceName, FrontMatters, NamespaceInfo, NamespaceData } from './ehtag';
import type { RawTag } from '../raw-tag';
import type { TagRecord } from '../tag-record';

export interface NamespaceDatabaseView {
    readonly name: NamespaceName;
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
