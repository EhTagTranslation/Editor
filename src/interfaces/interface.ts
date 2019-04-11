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

export interface ETRepoInfo {
  repo: string;
  head: Commit;
  version: number;
  data: ETNamespaceInfo[];
}

export interface ETRoot extends ETRepoInfo {
  data: ETNamespace[];
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
