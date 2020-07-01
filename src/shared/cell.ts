import { CellType, TagType } from './interfaces/ehtag';
import { parse, render } from './markdown';
import { Context } from './interfaces/database';
import { Tree } from './interfaces/ehtag.ast';

export class Cell {
    constructor(raw: string) {
        raw = raw.trim();
        this.input = raw;
    }
    readonly input: string;
    private cache!: Partial<CellType<'full'>>;
    private revision?: number;

    private getCache<T extends TagType>(target: T, revision: number): CellType<T> | undefined {
        if (revision !== this.revision) {
            this.cache = {};
            this.revision = revision;
            return undefined;
        }
        const cache = this.cache;
        if (target === 'full') {
            if (cache.ast && cache.html && cache.raw && cache.text) {
                return cache as CellType<T>;
            } else {
                return undefined;
            }
        } else {
            return cache[target as Exclude<TagType, 'full'>] as CellType<T> | undefined;
        }
    }
    private setCache<T extends TagType>(target: T, revision: number, rendered: CellType<T>): void {
        if (this.revision !== revision) {
            this.cache = {};
        }
        if (target === 'full') {
            const i = rendered as CellType<'full'>;
            this.cache.raw = i.raw;
            this.cache.text = i.text;
            this.cache.html = i.html;
            this.cache.ast = i.ast;
        } else {
            this.cache[target as Exclude<TagType, 'full'>] = rendered as string & Tree;
        }
        this.revision = revision;
    }
    render<T extends TagType>(target: T, context: Context): CellType<T> {
        const revision = context.database.revision;
        const cache = this.getCache(target, revision);
        if (cache) return cache;

        const tokens = parse(this.input, context);
        const result = render(tokens, target);
        this.setCache(target, revision, result);
        return result;
    }
}
