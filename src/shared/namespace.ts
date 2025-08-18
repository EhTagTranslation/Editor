import { NamespaceName } from './interfaces/ehtag.js';

const nsDic: Record<string, NamespaceName> = {
    rows: 'rows',

    x: 'mixed',
    mix: 'mixed',
    mixed: 'mixed',

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

    cos: 'cosplayer',
    coser: 'cosplayer',
    cosplayer: 'cosplayer',

    m: 'male',
    male: 'male',

    f: 'female',
    female: 'female',

    o: 'other',
    other: 'other',

    loc: 'location',
    location: 'location',
};

export function parseNamespace(ns: string | null | undefined): NamespaceName | undefined {
    if (typeof ns != 'string' || !ns) return undefined;
    if (ns in nsDic) return nsDic[ns];
    ns = ns.toLowerCase();
    if (ns in nsDic) return nsDic[ns];
    ns = ns.trim();
    if (ns in nsDic) return nsDic[ns];
    return undefined;
}

export function isNamespaceName(ns: unknown): ns is NamespaceName {
    if (typeof ns != 'string') return false;
    return NamespaceName.includes(ns as NamespaceName);
}
