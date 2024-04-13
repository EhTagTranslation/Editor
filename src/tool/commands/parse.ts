import { program } from '@commander-js/extra-typings';
import { TagRecord } from '#shared/tag-record';
import { Database } from '#shared/database';
import { Context } from '#shared/markdown/index';
import { Cell } from '#shared/cell';
import { parseNamespace } from '#shared/namespace';
import type { NamespaceName, TagType } from '#shared/interfaces/ehtag';

const parse = program
    .command('parse')
    .description('解析输入的数据')
    .option('--context <db>', '用于分析的上下文数据库')
    .option('--ns <namespace>', '用于分析的命名空间上下文')
    .option('--out-type <raw|ast|html|text>', '输出格式');

const opts = async (): Promise<{
    db: Database;
    ns: NamespaceName;
    outType: TagType;
}> => {
    const { context, outType, ns } = parse.opts();
    return {
        db: await Database.create(String(context ?? '.')),
        outType: String(outType ?? 'raw').toLowerCase() as TagType,
        ns: parseNamespace(ns) ?? 'other',
    };
};

function print(data: unknown): void {
    if (typeof data == 'string') {
        return console.log(data);
    }
    return console.dir(data, {
        depth: null,
    });
}

parse
    .command('line')
    .description('解析 MD 表格行')
    .argument('line', '输入的 MD 表格行')
    .action(async (line: string) => {
        const { db, outType, ns } = await opts();
        const parsed = TagRecord.parse(line, db.data[ns]);
        if (parsed) {
            print({
                raw: parsed[0],
                ...parsed[1].render(outType, new Context(parsed[1], parsed[0])),
            });
        } else {
            console.error('解析失败');
        }
    });

parse
    .command('cell')
    .description('解析 MD 单元格')
    .argument('cell', '输入的 MD 单元格')
    .action(async (cell: string) => {
        const { db, outType, ns } = await opts();
        const parsed = new Cell(cell);
        return print(parsed.render(outType, new Context(db.data[ns])));
    });
