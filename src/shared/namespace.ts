import { NamespaceName } from './interfaces/ehtag';

const nsDic: { [k: string]: NamespaceName } = {
    rows: 'rows',

    '': 'misc',
    misc: 'misc',
    miscellaneous: 'misc',

    r: 'reclass',
    reclass: 'reclass',

    l: 'language',
    language: 'language',
    lang: 'language',

    p: 'parody',
    parody: 'parody',
    series: 'parody',

    c: 'character',
    char: 'character',
    character: 'character',

    g: 'group',
    group: 'group',
    creator: 'group',
    circle: 'group',

    a: 'artist',
    artist: 'artist',

    m: 'male',
    male: 'male',

    f: 'female',
    female: 'female',
};

export function parseNamespace(ns: string | null | undefined): NamespaceName {
    if (!ns) return 'misc';
    if (ns in nsDic) return nsDic[ns];
    ns = ns.toLowerCase();
    if (ns in nsDic) return nsDic[ns];
    ns = ns.trim();
    if (ns in nsDic) return nsDic[ns];
    ns = ns[0];
    if (ns in nsDic) return nsDic[ns];
    return 'misc';
}

export function isNamespaceName(ns: unknown): ns is NamespaceName {
    if (typeof ns != 'string') return false;
    return NamespaceName.includes(ns as NamespaceName);
}
