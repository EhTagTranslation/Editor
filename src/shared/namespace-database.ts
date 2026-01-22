import { createReadStream } from 'node:fs';
import { writeFile } from 'node:fs/promises';
import { createInterface } from 'node:readline/promises';
import { load, dump } from 'js-yaml';
import type { NamespaceName, FrontMatters, NamespaceInfo, TagType, NamespaceData } from './interfaces/ehtag.js';
import { TagRecord } from './tag-record.js';
import type { Database } from './database.js';
import type { RawTag } from './raw-tag.js';
import type { NamespaceDatabaseView } from './interfaces/database.js';
import { Context } from './markdown/index.js';

interface TagLine {
    raw?: RawTag;
    record: TagRecord;
    line?: number;
}

export class NamespaceDatabase implements NamespaceDatabaseView {
    constructor(
        readonly name: NamespaceName,
        readonly file: string,
        readonly database: Database,
    ) {}

    frontMatters!: FrontMatters;
    private rawData: TagLine[] = [];
    private readonly rawMap = new Map<RawTag, TagLine>();
    private prefix = '';
    private suffix = '';
    /** 重新加载文件 */
    async load(): Promise<void> {
        const context = new Context(this);
        let state = 0;
        this.rawData = [];
        this.rawMap.clear();
        let prefix = '';
        let suffix = '';
        let frontMatters = '';
        let sep = '';
        let lineno = 0;
        for await (const line of createInterface(createReadStream(this.file))) {
            lineno++;
            const record = TagRecord.parse(line, this);
            [context.raw, context.tag] = record ?? [undefined, undefined];
            context.line = lineno;
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
                            line: lineno,
                        };
                        this.rawData.push(tagLine);
                        if (tagLine.raw) {
                            const previous = this.rawMap.get(tagLine.raw);
                            if (previous) {
                                context.error('重复的条目' + (previous?.line ? `：见 L${previous.line}` : ''));
                            } else {
                                this.rawMap.set(tagLine.raw, tagLine);
                            }
                        }
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
            fmObj = load(frontMatters) as typeof fmObj;
        }
        this.frontMatters = {
            name: '',
            description: '',
            ...fmObj,
            key: this.name,
        };
    }

    private countLines(str: string): number {
        let r = -1;
        let i = -1;
        do {
            i = str.indexOf('\n', i + 1);
            r++;
        } while (i >= 0);
        return r;
    }
    async save(): Promise<Buffer> {
        let content = '';
        const write = (v: string): void => {
            content += v;
        };

        let lineno = 1;
        write('---\n');
        lineno++;
        this.frontMatters.key = this.name;
        const fm = dump(this.frontMatters);
        write(fm);
        lineno += this.countLines(fm);
        write('---\n\n');
        lineno += 2;

        write(this.prefix);
        write('\n');
        lineno += this.countLines(this.prefix) + 1;

        const context = new Context(this);
        for (const { raw, record } of this.rawData) {
            context.raw = raw;
            context.line = lineno;
            write(record.stringify(context));
            write('\n');
            lineno++;
        }

        if (this.suffix) {
            write('\n');
            write(this.suffix);
            write('\n');
        }

        // 一次性写入，防止写一半爆炸导致数据丢失
        const buffer = Buffer.from(content, 'utf-8');
        await writeFile(this.file, buffer);
        return buffer;
    }

    info(): NamespaceInfo {
        return {
            namespace: this.name,
            frontMatters: this.frontMatters,
            count: this.rawMap.size,
        };
    }

    render<T extends TagType>(type: T): NamespaceData<T> {
        const info = this.info();
        const data: NamespaceData<T>['data'] = {};
        const context = new Context(this);
        for (const [raw, { record, line }] of this.rawMap) {
            context.raw = raw;
            context.line = line;
            data[raw] = record.render(type, context);
        }
        return {
            ...info,
            data,
        };
    }

    raw(): IterableIterator<[RawTag, TagLine]> {
        return this.rawMap.entries();
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

    set(raw: RawTag, record: TagRecord, newRaw?: RawTag): void {
        const line = this.rawMap.get(raw);
        if (line == null) throw new Error(`'${raw}' not found in namespace ${this.name}`);
        if (newRaw && this.rawMap.has(newRaw))
            throw new Error(`'${newRaw}' is already defined in namespace ${this.name}`);
        if (record.namespace !== this)
            throw new Error(`record namespace mismatch: ${record.namespace.name} != ${this.name}`);

        line.record = record;
        if (newRaw) {
            line.raw = newRaw;
            this.rawMap.delete(raw);
            this.rawMap.set(newRaw, line);
        }
        this.database.revision++;
    }

    add(raw: RawTag | undefined, record: TagRecord): void;
    add(raw: RawTag | undefined, record: TagRecord, pos: 'before' | 'after', ref: RawTag): void;
    add(raw: RawTag | undefined, record: TagRecord, pos?: 'before' | 'after', ref?: RawTag): void {
        if (raw && this.rawMap.has(raw)) throw new Error(`'${raw}' exists in namespace ${this.name}`);
        if (record.namespace !== this)
            throw new Error(`record namespace mismatch: ${record.namespace.name} != ${this.name}`);

        const line = { raw, record };
        if (pos) {
            if (!ref) throw new Error(`adding with position needs a ref tag`);
            const refLine = this.rawMap.get(ref);
            if (!refLine) throw new Error(`'${ref}' not found in namespace ${this.name}`);
            const refIndex = this.rawData.indexOf(refLine) + (pos === 'after' ? 1 : 0);
            this.rawData.splice(refIndex, 0, line);
        } else {
            this.rawData.push(line);
        }
        if (raw) this.rawMap.set(raw, line);
        this.database.revision++;
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
