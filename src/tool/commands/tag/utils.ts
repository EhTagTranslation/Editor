import type { Tag } from '../../../shared/ehentai';
import clc from 'cli-color';
import escapeRegexp from 'escape-string-regexp';

export function formatTag(tag: Pick<Tag, 'namespace' | 'raw'>, term?: string): string {
    let raw: string = tag.raw;
    if (term) {
        const reg = new RegExp(escapeRegexp(term), 'gi');
        raw = raw.replace(reg, clc.bold(term));
    }
    return `${clc.green(tag.namespace)}${clc.blackBright(':')}${raw}`;
}
