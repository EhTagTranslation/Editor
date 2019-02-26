export interface ETRoot extends ETRepoInfo {
  data: ETNamespace[];
}

export interface Signature {
  name: string;
  email: string;
  when: Date;
}

export interface Commit {
  author: Signature;
  committer: Signature;
  sha: string;
  message: string;
}

export interface Row {
  namespace: string;
  count: number;
}

export interface ETRepoInfo {
  repo: string;
  head: Commit;
  version: number;
  data: ETNamespaceInfo[];
}

export type ETNamespaceName = 'row'
  | 'reclass'
  | 'language'
  | 'parody'
  | 'character'
  | 'group'
  | 'artist'
  | 'male'
  | 'female'
  | 'misc';

export interface ETNamespaceInfo {
  count: number;
  namespace: ETNamespaceName;

}

export interface ETNamespace extends ETNamespaceInfo {
  data: { [row: string]: ETTag };
}

export interface ETTag {
  intro: string;
  links: string;
  name: NonNullable<string>;
}

export interface ETKey {
  raw: NonNullable<string>;
  namespace: ETNamespaceName;
}

export interface ETItem extends ETTag, ETKey { }
