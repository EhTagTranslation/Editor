import type {
    RepoInfo,
    TagType,
    RepoData,
    NamespaceName,
    FrontMatters,
    NamespaceInfo,
    NamespaceData,
} from './ehtag.js';
import type { RawTag } from '../raw-tag.js';
import type { TagRecord } from '../tag-record.js';

export const SUPPORTED_REPO_VERSION = 7;

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
    readonly data: Readonly<Record<NamespaceName, NamespaceDatabaseView>>;

    info(): Promise<RepoInfo>;

    render<T extends TagType>(type: T): Promise<RepoData<T>>;

    get(raw: RawTag): TagRecord | undefined;

    revision: number;
}
