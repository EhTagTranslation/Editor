type Sha1Value = string;

interface Signature {
    name: string;
    email: string;
    when: Date;
}

interface Commit {
    author: Signature;
    committer: Signature;
    sha: Sha1Value;
    message: string;
}

interface RepoInfo {
    repo: string;
    head: Commit;
    version: number;
    data: NamespaceInfo[];
}

interface RepoData<T extends TagType> extends RepoInfo {
    data: Array<NamespaceData<T>>;
}

const NamespaceName = [
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
] as const;
type NamespaceName = typeof NamespaceName[number];

interface NamespaceInfo {
    count: number;
    namespace: NamespaceName;
    frontMatters: FrontMatters;
}

interface FrontMatters {
    key: NamespaceName;
    name: string;
    description: string;
    copyright?: string;
    rules?: string[];
    example?: Tag<'raw'> & { raw: string };
}

interface NamespaceData<T extends TagType> extends NamespaceInfo {
    data: { [raw: string]: Tag<T> };
}

interface Tag<T extends TagType> {
    name: CellType<T>;
    intro: CellType<T>;
    links: CellType<T>;
}

type TagType = 'raw' | 'ast' | 'html' | 'text' | 'full';

export type CellType<T extends TagType> = T extends 'raw'
    ? string
    : T extends 'ast'
    ? Tree
    : T extends 'html'
    ? string
    : T extends 'text'
    ? string
    : T extends 'full'
    ? {
          raw: CellType<'raw'>;
          ast: CellType<'ast'>;
          html: CellType<'html'>;
          text: CellType<'text'>;
      }
    : never;
