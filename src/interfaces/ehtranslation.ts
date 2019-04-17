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

export type ETNamespaceName = 'rows'
  | 'reclass'
  | 'language'
  | 'parody'
  | 'character'
  | 'group'
  | 'artist'
  | 'male'
  | 'female'
  | 'misc';

export enum ETNamespaceEnum {
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

export interface RenderedETTag {
  renderedIntro: string;
  renderedLinks: string;
  renderedName: NonNullable<string>;
  textIntro: string;
  textLinks: string;
  textName: NonNullable<string>;
}

export interface ETKey {
  raw: NonNullable<string>;
  namespace: ETNamespaceName;
}

export interface ETItem extends ETTag, ETKey { }

export interface RenderedETItem extends ETTag, RenderedETTag, ETKey { }

export function isValidRaw(raw?: string | null) {
  if (!raw) {
    return false;
  }
  return raw.search(/^[-\.a-zA-Z0-9][- \.a-zA-Z0-9]*[-\.a-zA-Z0-9]$/) >= 0;
}

export const notEditableNs: ReadonlyArray<ETNamespaceName> = [
  'rows',
];
export const editableNs: ReadonlyArray<ETNamespaceName> = [
  'reclass',
  'language',
  'parody',
  'character',
  'group',
  'artist',
  'male',
  'female',
  'misc',
];


