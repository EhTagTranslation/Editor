import { Tag } from './interfaces/ehtag';
import { Cell } from './cell';
import { Context } from './markdown';

const recordRegex = /^\s*(?<!\\)\|?\s*(?<raw>.*?)\s*(?<!\\)\|\s*(?<name>.*?)\s*(?<!\\)\|\s*(?<intro>.*?)\s*(?<!\\)\|\s*(?<links>.*?)\s*(?<!\\)\|?\s*$/;

const unescapeRe1 = /<br\s*\/?>/g;
const unescapeRe2 = /(?<!\\)((?:\\\\)*)\\\|/g;
function unescape(value: string): string {
    return value.replace(unescapeRe1, '\n').replace(unescapeRe2, '$1|');
}

const escapeRe1 = /(\r\n|\n)/g;
const escapeRe2 = /(?<!\\)(\\\\)*\|/g;
function escape(value: string): string {
    return value.replace(escapeRe1, '<br>').replace(escapeRe2, '\\$&');
}

export class Record implements Tag<Cell> {
    constructor(data: Tag<'raw'>) {
        this.name = new Cell(data.name);
        this.intro = new Cell(data.intro);
        this.links = new Cell(data.links);
    }
    name!: Cell;
    intro!: Cell;
    links!: Cell;

    stringify(context: Context): string {
        const raw = context.raw.trim().toLowerCase();
        const render = (cell: Cell): string => escape(cell.render('raw', context));
        return `| ${raw} | ${render(this.name)} | ${render(this.intro)} | ${render(this.links)} |`;
    }

    static parse(line: string): [string, Record] | null {
        const match = recordRegex.exec(line);
        if (!match || !match.groups) return null;
        const raw = match.groups.raw.trim().toLowerCase();
        const { name, intro, links } = match.groups;
        return [
            raw,
            new Record({
                name: unescape(name),
                intro: unescape(intro),
                links: unescape(links),
            }),
        ];
    }
}
