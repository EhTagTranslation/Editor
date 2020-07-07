import { CellType, TagType } from '../interfaces/ehtag';
import { serialize } from 'parse5';
import { renderText } from './text-renderer';
import { renderHtml } from './html-renderer';
import { renderMd } from './md-renderer';
import { parseMd } from './md-parser';
import { Context } from '../interfaces/database';
import { Tree } from '../interfaces/ehtag.ast';

export interface ParseResult {
    raw: string;
    ast: Tree;
    context: Context;
}

export function parse(src: string, context: Context): ParseResult {
    const ast = parseMd(src, context);
    const result = { ast, context, raw: src };
    return result;
}

export const render = <T extends TagType>(parsed: ParseResult, target: T): CellType<T> => {
    const t = target as TagType;
    switch (t) {
        case 'raw':
            return renderMd(parsed.ast) as CellType<T>;
        case 'text':
            return renderText(parsed.ast) as CellType<T>;
        case 'html':
            return renderHtml(parsed.ast) as CellType<T>;
        case 'ast':
            return parsed.ast as CellType<T>;
        case 'full':
            return {
                raw: render(parsed, 'raw'),
                text: render(parsed, 'text'),
                html: render(parsed, 'html'),
                ast: render(parsed, 'ast'),
            } as CellType<T>;
        default: {
            const _: never = t;
            throw new Error(`Unknown tag type ${target}`);
        }
    }
};
