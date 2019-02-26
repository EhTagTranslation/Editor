export interface ETRooot extends ETRepoInfo {
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
  | 'reclas'
  | 'languag'
  | 'parod'
  | 'characte'
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
  name: string;
}

export interface ETItem {
  raw: string;
  intro: string;
  links: string;
  name: string;
  namespace: ETNamespaceName;
}
