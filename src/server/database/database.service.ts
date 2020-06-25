import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectableBase } from 'server/injectable-base';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as execa from 'execa';
import * as shell from 'shell-quote';

let execId = 0;

@Injectable()
export class DatabaseService extends InjectableBase implements OnModuleInit {
    constructor(private readonly config: ConfigService) {
        super();
        this.path = path.resolve(this.config.get('DB_PATH', './db'));
        this.origin = this.config.get('DB_REMOTE', '');
    }
    async onModuleInit(): Promise<void> {
        await fs.mkdirp(this.path);
        if (await fs.pathExists(path.join(this.path, '.git'))) {
            await this.git(`remote set-url origin '${this.origin}'`);
        } else {
            await this.git('init');
            await this.git(`remote add origin '${this.origin}'`);
        }
        await this.pull();
    }

    private async git(command: string): Promise<string> {
        const id = ++execId;
        const commands = shell.parse(command) as string[];
        commands.unshift('-C', this.path);
        this.logger.log(`Exec[${id}]: git ${command}`);
        const result = await execa('git', ['-C', this.path, ...commands], { all: true, reject: false });
        if (result.failed) {
            const err = result as execa.ExecaError;
            this.logger.error(`Exec[${id}]: ${err.all ?? ''}`);
            throw err;
        }
        this.logger.log(`Exec[${id}]: finished`);
        return result.all ?? '';
    }

    async pull(): Promise<void> {
        await this.git('fetch');
        await this.git('reset --hard origin/master');
    }

    readonly path: string;
    readonly origin: string;
}
