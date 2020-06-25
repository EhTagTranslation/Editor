import * as fs from 'fs-extra';
import * as path from 'path';
import * as execa from 'execa';
export class Database {
    constructor(public readonly path: string, public readonly origin: string) {}

    private async git(...commands: readonly string[]): Promise<string> {
        const result = await execa('git', ['-C', this.path, ...commands], { all: true });
        return result.all ?? '';
    }

    async initRepo(): Promise<void> {
        await fs.mkdirp(this.path);
        if (await fs.pathExists(path.join(this.path, '.git'))) {
            await this.git('remote', 'set-url', 'origin', this.origin);
        } else {
            await this.git('init');
            await this.git('remote', 'add', 'origin', this.origin);
        }
        await this.pull();
    }

    async pull(): Promise<void> {
        await this.git('fetch');
        await this.git('reset', '--hard', 'origin/master');
    }
}
