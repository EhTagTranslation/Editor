import { NamespaceName } from './ehtag';

export interface ETKey {
    raw: string;
    namespace: NamespaceName;
}

export function isValidRaw(raw?: string | null): boolean {
    if (!raw) {
        return false;
    }
    return raw.search(/^[-\.a-zA-Z0-9][- \.a-zA-Z0-9]*[-\.a-zA-Z0-9]$/) >= 0;
}

export const notEditableNs: readonly NamespaceName[] = ['rows', 'reclass', 'language', 'male', 'female', 'misc'];
export const editableNs: readonly NamespaceName[] = ['parody', 'character', 'group', 'artist'];
