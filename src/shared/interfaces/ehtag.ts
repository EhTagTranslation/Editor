import type * as Ast from './ehtag.ast';
import type { Opaque } from 'type-fest';

/** 表示一个 SHA1 字符串，用来记录 Git 版本 */
export type Sha1Value = Opaque<string, Commit>;
export const Sha1Value = Object.freeze(
    Object.assign(
        (value: string): Sha1Value | undefined => {
            if (typeof value != 'string') return undefined;
            if (value.length < 40) return undefined;
            value = value.trim().toLowerCase();
            if (value.length !== 40) return undefined;
            return value as Sha1Value;
        },
        {
            empty: '0'.repeat(40) as Sha1Value,
            validate(value: unknown): value is Sha1Value {
                return typeof value == 'string' && value.length === 40 && value.trim().length === 40;
            },
        },
    ),
);

/** 表示一个 Git 签名 */
export interface Signature {
    name: string;
    email: string;
    when: Date;
}

/** 表示一个 Git 提交 */
export interface Commit {
    author: Signature;
    committer: Signature;
    sha: Sha1Value;
    message: string;
}

/** 表示一个 Git Repo 的信息 */
export interface RepoInfo {
    repo: string;
    head: Commit;
    version: number;
    data: NamespaceInfo[];
}

/** 表示一个 Git Repo 的数据 */
export interface RepoData<T extends TagType> extends RepoInfo {
    data: Array<NamespaceData<T>>;
}

/** 命名空间的完整名称 */
export const NamespaceName = [
    'rows',
    'reclass',
    'language',
    'parody',
    'character',
    'group',
    'artist',
    'cosplayer',
    'male',
    'female',
    'mixed',
    'other',
] as const;
export type NamespaceName = typeof NamespaceName[number];

/** 表示一个命名空间的信息 */

export interface NamespaceInfo {
    /** 包含的记录条数 */
    count: number;
    namespace: NamespaceName;
    frontMatters: FrontMatters;
}

/** 表示命名空间文件头部数据 */
export interface FrontMatters {
    /** 命名空间完整名称 */
    key: NamespaceName;
    /** 命名空间简称 */
    abbr?: string;
    /** 命名空间的别名 */
    aliases?: string[];
    /** 命名空间中文名称 */
    name: string;
    /** 命名空间描述 */
    description: string;
    /** 内容版权信息 */
    copyright?: string;
    /** 内容书写规则 */
    rules?: string[];
    /** 示例 */
    example?: Tag<'raw'> & { raw: string };
}

/** 表示一个命名空间的数据 */
export interface NamespaceData<T extends TagType = TagType> extends NamespaceInfo {
    data: { [raw: string]: Tag<T> };
}

/** 表示一条翻译的内容 */
export interface Tag<T extends TagType = TagType> {
    name: CellType<T>;
    intro: CellType<T>;
    links: CellType<T>;
}

/** 翻译数据序列化的类型 */
export type TagType = 'raw' | 'ast' | 'html' | 'text' | 'full';

interface CellTypeMap extends Record<TagType, unknown> {
    raw: string;
    ast: Ast.Tree;
    text: string;
    full: { raw: CellType<'raw'>; ast: CellType<'ast'>; html: CellType<'html'>; text: CellType<'text'> };
}

/** 表示一条翻译的单元格内容 */
export type CellType<T extends TagType> = CellTypeMap[T];
