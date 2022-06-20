import type { NamespaceName } from '#shared/interfaces/ehtag';

export interface ETKey {
    raw: string;
    namespace: NamespaceName;
}
export const notEditableNs: readonly NamespaceName[] = [
    'rows',
    'reclass',
    'language',
    'male',
    'female',
    'mixed',
    'other',
];
export const editableNs: readonly NamespaceName[] = ['parody', 'character', 'group', 'artist', 'cosplayer'];
