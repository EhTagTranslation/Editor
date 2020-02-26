import { NamespaceName } from './ehtag';


export interface ETKey {
  raw: string;
  namespace: NamespaceName;
}

export function isValidRaw(raw?: string | null) {
  if (!raw) {
    return false;
  }
  return raw.search(/^[-\.a-zA-Z0-9][- \.a-zA-Z0-9]*[-\.a-zA-Z0-9]$/) >= 0;
}

export const notEditableNs: ReadonlyArray<NamespaceName> = [
  'rows',
  'reclass',
  'language',
  'male',
  'female',
  'misc',
];
export const editableNs: ReadonlyArray<NamespaceName> = [
  'parody',
  'character',
  'group',
  'artist',
];


