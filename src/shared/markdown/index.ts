import { CellType, TagType } from '../interfaces/ehtag';
import { parseFragment, serialize } from 'parse5';
import { renderText } from './text-renderer';
import { parseTreeAdapter, serializeTreeAdapter, DocumentFragment } from './html-tree-adapter';
import { normalizeAst } from './ast-normalizer';
import { renderMd } from './md-renderer';
import { parseMd } from './md-parser';
import { Context } from '../interfaces/database';

export interface ParseResult {
    raw: string;
    doc: DocumentFragment;
    context: Context;
}

function parseImpl(src: string, context: Context): ParseResult {
    const html = parseMd(src);
    const doc = parseFragment(html, { treeAdapter: parseTreeAdapter }) as DocumentFragment;
    const result = { doc, context, raw: src };
    normalizeAst(result);
    return result;
}

export function normalize(src: string, context: Context): string {
    context.normalized = false;
    const r = parseImpl(src, context);
    return renderMd(r.doc.content);
}

export function parse(src: string, context: Context): ParseResult {
    src = normalize(src, context);
    context.normalized = true;
    return parseImpl(src, context);
}

export const render = <T extends TagType>(parsed: ParseResult, target: T): CellType<T> => {
    const t = target as TagType;
    switch (t) {
        case 'raw':
            return parsed.raw as CellType<T>;
        case 'text':
            return renderText(parsed.doc.content) as CellType<T>;
        case 'html':
            return serialize(parsed.doc, { treeAdapter: serializeTreeAdapter }) as CellType<T>;
        case 'ast':
            return parsed.doc.content as CellType<T>;
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
