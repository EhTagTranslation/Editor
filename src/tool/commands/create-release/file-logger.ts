import clc from 'cli-color';
import path from 'node:path';
import { type Context, Logger } from '#shared/markdown/index';

export class FileLogger extends Logger {
    constructor(readonly location: string) {
        super();
    }
    protected log(logger: 'info' | 'warn' | 'error', context: Context, message: string): void {
        const color = ({ info: 'blue', warn: 'yellow', error: 'red' } as const)[logger];
        process.stderr.write(clc[color](`[${logger.slice(0, 4).toUpperCase()}] `));

        const f = path.relative(
            process.cwd(),
            path.resolve(this.location ?? '.', `./database/${context.namespace.name}.md`),
        );
        if (context.line) {
            if (context.column) process.stderr.write(clc.underline(`${f}:${context.line}:${context.column}`));
            else process.stderr.write(clc.underline(`${f}:${context.line}`));
        } else {
            process.stderr.write(clc.underline(f));
        }
        process.stderr.write(clc.black(`: `));

        const raw = context.raw ?? '<unknown raw>';
        process.stderr.write(clc.bold(raw));
        process.stderr.write(clc.black(`: `));

        process.stderr.write(message);
        process.stderr.write(`\n`);
    }
}
