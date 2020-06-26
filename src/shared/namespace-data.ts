import * as fs from 'fs-extra';
import * as readline from 'readline';
import { NamespaceName, FrontMatters } from './interfaces/ehtag';
import { safeLoad, safeDump } from 'js-yaml';
import { Record } from './record';
import { defaults } from 'lodash';
import { promisify } from 'util';
import { Context } from './markdown';
import { Database } from './database';

export class NamespaceData {
    constructor(readonly namespace: NamespaceName, readonly file: string, private readonly database: Database) {}

    frontMatters!: FrontMatters;
    private rawData = new Array<[string, Record]>();
    private prefix = '';
    private suffix = '';
    async load(): Promise<void> {
        const reader = readline.createInterface({
            input: fs.createReadStream(this.file, { encoding: 'utf-8' }),
        });
        let state = 0;
        this.rawData = [];
        let prefix = '';
        let suffix = '';
        let frontMatters = '';
        let sep = '';
        for await (const line of reader) {
            const record = Record.parse(line);

            switch (state) {
                case 0: {
                    if (/^-+$/.test(line)) {
                        state = 1;
                        sep = line;
                    } else {
                        prefix += line;
                        prefix += '\n';
                        if (record) {
                            state = 3;
                        } else {
                            state = 2;
                        }
                    }
                    continue;
                }
                case 1: {
                    if (line === sep) {
                        state = 2;
                    } else {
                        frontMatters += line;
                        frontMatters += '\n';
                    }
                    continue;
                }
                case 2: {
                    prefix += line;
                    prefix += '\n';
                    if (record) {
                        state = 3;
                    }
                    continue;
                }
                case 3: {
                    prefix += line;
                    prefix += '\n';
                    if (!record) {
                        state = 2;
                    } else {
                        state = 4;
                    }
                    continue;
                }
                case 4: {
                    if (record) {
                        this.rawData.push(record);
                    } else {
                        suffix += line;
                        suffix += '\n';
                        state = 5;
                    }
                    continue;
                }
                default: {
                    suffix += line;
                    suffix += '\n';
                    continue;
                }
            }
        }
        this.prefix = prefix.trim();
        this.suffix = suffix.trim();
        if (frontMatters) {
            const fmObj = safeLoad(frontMatters);
            if (fmObj && typeof fmObj == 'object') {
                this.frontMatters = fmObj as FrontMatters;
            }
        }
        this.frontMatters = defaults({ key: this.namespace }, this.frontMatters, { name: '', description: '' });
    }
    async save(): Promise<void> {
        let content = '';
        const write = (v: string): void => {
            content += v;
        };

        write('---\n');
        this.frontMatters.key = this.namespace;
        write(safeDump(this.frontMatters));
        write('---\n\n');

        write(this.prefix);
        write('\n');

        const context: Context = {
            database: this.database,
            namespace: this.namespace,
            raw: '',
        };
        for (const [raw, record] of this.rawData) {
            context.raw = raw;
            write(record.stringify(context));
            write('\n');
        }

        if (this.suffix) {
            write('\n');
            write(this.suffix);
            write('\n');
        }

        const writer = fs.createWriteStream(this.file, { encoding: 'utf-8' });
        writer.write(content);
        await promisify(writer.end.bind(writer))();
    }
}
