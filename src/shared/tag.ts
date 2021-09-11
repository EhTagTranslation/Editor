import { parseNamespace } from './namespace';
import type { NamespaceName } from './interfaces/ehtag';
import { RawTag } from './raw-tag';

export function parseTag(tag: string):
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
            ns: ns != null ? namespace : undefined,
            raw: tag.trim().toLowerCase(),
        };
    return {
        valid: true,
        ns: ns != null ? namespace : undefined,
        raw,
    };
}

/** 生成含命名空间 `f` 和 `m` 的标签 */
export function tagAbbr(tag: RawTag, ns?: NamespaceName): string {
    if (ns === 'male') return `m:${tag}`;
    if (ns === 'female') return `f:${tag}`;
    return tag;
}

/** 生成含命名空间的标签 */
export function tagFull(tag: RawTag, ns: NamespaceName): string {
    return `${ns}:${tag}`;
}

const nsDic: Record<NamespaceName, string> = {
    rows: 'rows',
    misc: '',
    reclass: 'r',
    language: 'l',
    parody: 'p',
    character: 'c',
    group: 'g',
    artist: 's',
    male: 'm',
    female: 'f',
};

/** 生成含单字母命名空间的标签 */
export function tagAbbrFull(tag: RawTag, ns: NamespaceName): string {
    return `${nsDic[ns]}:${tag}`;
}
