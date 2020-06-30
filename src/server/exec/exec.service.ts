import { Injectable } from '@nestjs/common';
import { InjectableBase } from 'server/injectable-base';
import * as execa from 'execa';
import * as shell from 'shell-quote';

@Injectable()
export class ExecService extends InjectableBase {
    async git(repo: string, command: string[], log?: string): Promise<string>;
    async git(repo: string, command: string, log?: string): Promise<string>;
    async git(repo: string, command: string | string[], log?: string): Promise<string> {
        const parsed = this.parse(command, log);
        parsed.commands.unshift('git', '-C', repo);

        return this.execImpl(parsed.commands, `git ${parsed.log}`);
    }

    async exec(command: string | string[], log?: string): Promise<string> {
        const parsed = this.parse(command, log);
        return this.execImpl(parsed.commands, parsed.log);
    }

    private parse(command: string | string[], log?: string): { commands: string[]; log: string } {
        log = log ?? (typeof command == 'string' ? command : shell.quote(command));
        const commands = typeof command == 'string' ? (shell.parse(command) as string[]) : command;
        return { commands, log };
    }

    private async execImpl(commands: string[], log: string): Promise<string> {
        const file = commands.shift();
        if (!file) throw new Error(`Invalid command (${log})`);

        const start = Date.now();
        const result = await execa(file, commands, { all: true, reject: false });
        const elapsed = Date.now() - start;

        this.logger[result.failed ? 'error' : 'log'](`EXEC ${log} - in ${elapsed}ms`);
        if (result.all) this.logger.verbose(result.all);
        if (result.failed) {
            const err = result as execa.ExecaError;
            throw err;
        }
        return result.all ?? '';
    }
}
