import { Tag, TagType } from './interfaces/ehtag';
import { Cell } from './cell';
import { NamespaceDatabaseView } from './interfaces/database';
import { Context } from './markdown';
import { RawTag } from './validate';

const recordRegex = /^\s*(?<!\\)\|?\s*(?<raw>.*?)\s*(?<!\\)\|\s*(?<name>.*?)\s*(?<!\\)\|\s*(?<intro>.*?)\s*(?<!\\)\|\s*(?<links>.*?)\s*(?<!\\)\|?\s*$/;

function unescape(value: string): string {
    return value.replace(/<br\s*\/?>/g, '\n');
}

function escape(value: string): string {
    return value.replace(/(\r\n|\n)/g, '<br>').replace(/\|/g, '\\|');
}

export class TagRecord implements Tag<Cell> {
    constructor(data: Tag<'raw'>, readonly namespace: NamespaceDatabaseView) {
        this.name = new Cell(data.name.trim());
        this.intro = new Cell(data.intro.trim());
        this.links = new Cell(data.links.trim());
    }
    readonly name: Cell;
    readonly intro: Cell;
    readonly links: Cell;

    stringify(context: Context): string {
        const raw = context.raw?.trim().toLowerCase() ?? '';
        const render = (cell: Cell): string => escape(cell.render('raw', context));
        const name = render(this.name);
        if (raw && !RawTag(raw)) {
            context.warn('无效的原始标签');
        }
        if (raw && !name) {
            context.error('名称为空');
        }
        return `| ${raw} | ${name} | ${render(this.intro)} | ${render(this.links)} |`;
    }

    render<T extends TagType>(type: T, context: Context): Tag<T> {
        return {
            name: this.name.render(type, context),
            intro: this.intro.render(type, context),
            links: this.links.render(type, context),
        };
    }

    static parse(line: string, namespace: NamespaceDatabaseView): [RawTag | undefined, TagRecord] | undefined {
        const match = recordRegex.exec(line);
        if (!match || !match.groups) return undefined;
        const { raw, name, intro, links } = match.groups;
        const record = new TagRecord(
            {
                name: unescape(name),
                intro: unescape(intro),
                links: unescape(links),
            },
            namespace,
        );
        return [RawTag(raw), record];
    }
}
