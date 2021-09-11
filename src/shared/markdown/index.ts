import type { CellType, TagType } from '../interfaces/ehtag';
import { renderText } from './text-renderer';
import { renderHtml } from './html-renderer';
import { renderMd } from './md-renderer';
import { parseMd } from './md-parser';
import type { Context } from './context';
export * from './context';
import type { Tree } from '../interfaces/ehtag.ast';
export function parse(src: string, context: Context): Tree {
    const ast = parseMd(src, context);
    return ast;
}

export const render = <T extends TagType>(parsed: Tree, target: T): CellType<T> => {
    const t = target as TagType;
    switch (t) {
        case 'raw':
            return renderMd(parsed) as CellType<T>;
        case 'text':
            return renderText(parsed) as CellType<T>;
        case 'html':
            return renderHtml(parsed) as CellType<T>;
        case 'ast':
            return parsed as CellType<T>;
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
