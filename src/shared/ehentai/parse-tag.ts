import { NamespaceName } from '../interfaces/ehtag';
import { RawTag } from '../validate';

const nsDic: { [k: string]: NamespaceName } = {
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

export function parseTag(
    tag: string,
):
    | {
          valid: true;
          ns: NamespaceName | undefined;
          raw: RawTag;
      }
    | {
          valid: false;
          ns: NamespaceName | undefined;
          raw: string;
      } {
    tag = tag ?? '';
    let ns: string | undefined;
    const i = tag.indexOf(':');
    if (i >= 0) {
        ns = tag.slice(0, i);
        tag = tag.slice(i + 1);
    }
    const namespace = parseNamespace(ns);
    const raw = RawTag(tag);
    if (!raw)
        return {
            valid: false,
            ns: ns ? namespace : undefined,
            raw: tag.trim().toLowerCase(),
        };
    return {
        valid: true,
        ns: ns ? namespace : undefined,
        raw,
    };
}
