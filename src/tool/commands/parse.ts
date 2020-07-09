import { program } from 'commander';
import { TagRecord } from '../../shared/tag-record';
import { Database } from '../../shared/database';
import { Context } from '../../shared/markdown';
import { Cell } from '../../shared/cell';
import { TagType } from '../../shared/interfaces/ehtag';

const parse = program
    .command('parse')
    .description('解析输入的数据')
    .option('--context <db>', '用于分析的上下文数据库')
    .option('--out-type <raw|ast|html|text>', '输出格式');

const opts = async (): Promise<{
    db: Database;
    outType: TagType;
}> => {
    const { context, outType } = parse.opts();
    return {
        db: await Database.create(String(context ?? '.')),
        outType: String(outType ?? 'raw').toLowerCase() as TagType,
    };
};

parse
    .command('line <line>')
    .description('解析 MD 表格行', { line: '输入的 MD 表格行' })
    .action(async (line: string) => {
        const { db, outType } = await opts();
        const parsed = TagRecord.parse(line, db.data.rows);
        if (parsed) {
            console.log({
                raw: parsed[0],
                ...parsed[1].render(outType, new Context(parsed[1], parsed[0])),
            });
        } else {
            console.error('解析失败');
        }
    });

parse
    .command('cell <cell>')
    .description('解析 MD 单元格', { cell: '输入的 MD 单元格' })
    .action(async (cell: string) => {
        const { db, outType } = await opts();
        const parsed = new Cell(cell);
        return console.log(parsed.render(outType, new Context(db.data.rows)));
    });
