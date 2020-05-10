import * as Ast from './ehtag.ast';

export type Sha1Value = string;

export interface Signature {
    name: string;
    email: string;
    when: Date;
}

export interface Commit {
    author: Signature;
    committer: Signature;
    sha: Sha1Value;
    message: string;
}

export interface RepoInfo {
    repo: string;
    head: Commit;
    version: number;
    data: NamespaceInfo[];
}

export interface RepoData<T extends TagType> extends RepoInfo {
    data: Array<NamespaceData<T>>;
}

export type NamespaceName =
    | 'rows'
    | 'reclass'
    | 'language'
    | 'parody'
    | 'character'
    | 'group'
    | 'artist'
    | 'male'
    | 'female'
    | 'misc';

export enum NamespaceEnum {
    'rows',
    'reclass',
    'language',
    'parody',
    'character',
    'group',
    'artist',
    'male',
    'female',
    'misc',
}

export interface NamespaceInfo {
    count: number;
    namespace: NamespaceName;
    frontMatters: FrontMatters;
}

export interface FrontMatters {
    key: NamespaceName;
    name: string;
    description: string;
    copyright?: string;
    rules?: string[];
}

export interface NamespaceData<T extends TagType> extends NamespaceInfo {
    data: { [raw: string]: Tag<T> };
}

export interface Tag<T extends TagType> {
    intro: CellType<T>;
    links: CellType<T>;
    name: CellType<T>;
}

export type TagType = 'raw' | 'ast' | 'html' | 'text' | 'full';

export type CellType<T extends TagType> = T extends 'raw'
    ? string
    : T extends 'ast'
    ? Ast.Tree
    : T extends 'html'
    ? string
    : T extends 'text'
    ? string
    : T extends 'full'
    ? { raw: CellType<'raw'>; ast: CellType<'ast'>; html: CellType<'html'>; text: CellType<'text'> }
    : never;
