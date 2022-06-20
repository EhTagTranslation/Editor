import type { CellType, TagType } from '../interfaces/ehtag.js';
import { renderText } from './text-renderer.js';
import { renderHtml } from './html-renderer.js';
import { renderMd } from './md-renderer.js';
import { parseMd } from './md-parser.js';
import type { Context } from './context.js';
export * from './context.js';
import type { Tree } from '../interfaces/ehtag.ast.js';
export function parse(src: string, context: Context): Tree {
    const ast = parseMd(src, context);
    return ast;
}

export const render = <T extends TagType>(parsed: Tree, target: T): CellType<T> => {
    switch (target) {
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
            const _: never = target;
            throw new Error(`Unknown tag type ${target}`);
        }
    }
};
