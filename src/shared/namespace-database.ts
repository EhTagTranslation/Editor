import * as fs from 'fs-extra';
import * as readline from 'readline';
import { NamespaceName, FrontMatters, NamespaceInfo, TagType, NamespaceData } from './interfaces/ehtag';
import { safeLoad, safeDump } from 'js-yaml';
import { TagRecord } from './tag-record';
import { defaults, cloneDeep } from 'lodash';
import { promisify } from 'util';
import { Context } from './markdown';
import { Database } from './database';

export class NamespaceDatabase {
    constructor(readonly namespace: NamespaceName, readonly file: string, readonly database: Database) {}

    frontMatters!: FrontMatters;
    private rawData = new Array<[string, TagRecord]>();
    private rawMap = new Map<string, number>();
    private prefix = '';
    private suffix = '';
    async load(): Promise<void> {
        const reader = readline.createInterface({
            input: fs.createReadStream(this.file, { encoding: 'utf-8' }),
        });
        let state = 0;
        this.rawData = [];
        this.rawMap.clear();
        let prefix = '';
        let suffix = '';
        let frontMatters = '';
        let sep = '';
        for await (const line of reader) {
            const record = TagRecord.parse(line, this);

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
                        if (record[0]) this.rawMap.set(record[0], this.rawData.length - 1);
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
            namespace: this,
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

    info(): NamespaceInfo {
        return {
            namespace: this.namespace,
            frontMatters: cloneDeep(this.frontMatters),
            count: this.rawMap.size,
        };
    }

    render<T extends TagType>(type: T): NamespaceData<T> {
        const info = this.info();
        const data: NamespaceData<T>['data'] = {};
        const context: Context = {
            database: this.database,
            namespace: this,
            raw: '',
        };
        for (const [k, i] of this.rawMap) {
            const record = this.rawData[i];
            context.raw = k;
            data[k] = record[1].render(type, context);
        }
        return {
            ...info,
            data,
        };
    }

    get(raw: string): TagRecord | undefined {
        const i = this.rawMap.get(raw);
        if (i == null) return undefined;
        return this.rawData[i][1];
    }
}
