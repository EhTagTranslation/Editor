import fs from 'fs-extra';
import readline from 'readline';
import { NamespaceName, FrontMatters, NamespaceInfo, TagType, NamespaceData, Tag } from './interfaces/ehtag';
import { safeLoad, safeDump } from 'js-yaml';
import { TagRecord } from './tag-record';
import { Database } from './database';
import { RawTag } from './validate';
import { Context, NamespaceDatabaseView } from './interfaces/database';
import { Readable, Stream, PassThrough } from 'stream';

interface TagLine {
    raw?: RawTag;
    record: TagRecord;
}

export class NamespaceDatabase implements NamespaceDatabaseView {
    constructor(readonly namespace: NamespaceName, readonly file: string, readonly database: Database) {}

    frontMatters!: FrontMatters;
    private rawData = new Array<TagLine>();
    private rawMap = new Map<RawTag, TagLine>();
    private prefix = '';
    private suffix = '';
    /** 优先使用 data 中的数据，其次使用文件 */
    async load(data?: Buffer): Promise<void> {
        let input: NodeJS.ReadableStream;
        if (data && data.length > 0) {
            const bufferStream = new PassThrough();
            bufferStream.end(data);
            input = bufferStream;
        } else {
            input = fs.createReadStream(this.file);
        }
        const reader = readline.createInterface({ input });
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
                        const tagLine = {
                            raw: record[0],
                            record: record[1],
                        };
                        this.rawData.push(tagLine);
                        if (tagLine.raw) this.rawMap.set(tagLine.raw, tagLine);
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
        let fmObj: Partial<FrontMatters> | undefined;
        if (frontMatters) {
            fmObj = safeLoad(frontMatters) as typeof fmObj;
        }
        this.frontMatters = {
            name: '',
            description: '',
            ...fmObj,
            key: this.namespace,
        };
    }
    async save(): Promise<Buffer> {
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

        const context = new Context(this);
        for (const { raw, record } of this.rawData) {
            context.raw = raw;
            write(record.stringify(context));
            write('\n');
        }

        if (this.suffix) {
            write('\n');
            write(this.suffix);
            write('\n');
        }

        // 一次性写入，防止写一半爆炸导致数据丢失
        const buffer = Buffer.from(content, 'utf-8');
        await fs.writeFile(this.file, buffer);
        return buffer;
    }

    info(): NamespaceInfo {
        return {
            namespace: this.namespace,
            frontMatters: this.frontMatters,
            count: this.rawMap.size,
        };
    }

    render<T extends TagType>(type: T): NamespaceData<T> {
        const info = this.info();
        const data: NamespaceData<T>['data'] = {};
        const context = new Context(this);
        for (const [raw, { record }] of this.rawMap) {
            context.raw = raw;
            data[raw] = record.render(type, context);
        }
        return {
            ...info,
            data,
        };
    }

    get size(): number {
        return this.rawMap.size;
    }

    get(raw: RawTag): TagRecord | undefined {
        const line = this.rawMap.get(raw);
        if (line == null) return undefined;
        return line.record;
    }

    has(raw: RawTag): boolean {
        return this.rawMap.has(raw);
    }

    set(raw: RawTag, record: Tag<'raw'>, newRaw?: RawTag): TagRecord {
        const line = this.rawMap.get(raw);
        if (line == null) throw new Error(`'${raw}' not found in namespace ${this.namespace}`);
        if (newRaw && this.rawMap.has(newRaw))
            throw new Error(`'${newRaw}' is already defined in namespace ${this.namespace}`);

        line.record = new TagRecord(record, this);
        if (newRaw) {
            line.raw = newRaw;
            this.rawMap.delete(raw);
            this.rawMap.set(newRaw, line);
        }
        this.database.revision++;
        return line.record;
    }

    add(raw: RawTag | undefined, record: Tag<'raw'>): TagRecord;
    add(raw: RawTag | undefined, record: Tag<'raw'>, pos: 'before' | 'after', ref: RawTag): TagRecord;
    add(raw: RawTag | undefined, record: Tag<'raw'>, pos?: 'before' | 'after', ref?: RawTag): TagRecord {
        if (raw && this.rawMap.has(raw)) throw new Error(`'${raw}' exists in namespace ${this.namespace}`);

        const line = { raw, record: new TagRecord(record, this) };
        if (pos) {
            if (!ref) throw new Error(`adding with position needs a ref tag`);
            const refLine = this.rawMap.get(ref);
            if (!refLine) throw new Error(`'${ref}' not found in namespace ${this.namespace}`);
            const refIndex = this.rawData.indexOf(refLine) + (pos === 'after' ? 1 : 0);
            this.rawData.splice(refIndex, 0, line);
        } else {
            this.rawData.push(line);
        }
        if (raw) this.rawMap.set(raw, line);
        this.database.revision++;
        return line.record;
    }

    delete(raw: RawTag): TagRecord | undefined {
        const line = this.rawMap.get(raw);
        if (!line) return undefined;
        this.rawMap.delete(raw);
        this.rawData.splice(this.rawData.indexOf(line), 1);
        this.database.revision++;
        return line.record;
    }
}
