import * as fs from 'fs-extra';
import * as readline from 'readline';
import * as path from 'path';
import { NamespaceName, FrontMatters } from './interfaces/ehtag';
import { safeLoad, safeDump } from 'js-yaml';
import { Record } from './record';
import { defaults } from 'lodash';
import { promisify } from 'util';

export class NamespaceData {
    constructor(readonly namespace: NamespaceName, readonly file: string) {}

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
        const writer = fs.createWriteStream(this.file, { encoding: 'utf-8' });
        const write = promisify(writer.write.bind(writer));

        await write('---\n');
        this.frontMatters.key = this.namespace;
        await write(safeDump(this.frontMatters));
        await write('---\n\n');

        await write(this.prefix);
        await write('\n');

        for (const [raw, record] of this.rawData) {
            await write(record.stringify(raw));
            await write('\n');
        }

        if (this.suffix) {
            await write('\n');
            await write(this.suffix);
            await write('\n');
        }

        await promisify(writer.end.bind(writer))();
    }
}
