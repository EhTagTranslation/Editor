import { CellType, TagType } from './interfaces/ehtag';
import { parse, render, Context } from './markdown';

export class Cell {
    constructor(raw: string) {
        raw = raw.trim();
        this.input = raw;
    }
    readonly input: string;
    render<T extends TagType>(target: T, context: Context): CellType<T> {
        const tokens = parse(this.input, context);
        return render(tokens, target);
    }
}
