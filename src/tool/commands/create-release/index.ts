import { error, notice, warning } from '@actions/core';
import clc from 'cli-color';
import { program } from 'commander';
import fs from 'fs-extra';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';
import { parseNamespace } from '#shared/namespace';
import { Database } from '#shared/database';
import { getTagGroups, normalizeTag } from '#shared/ehentai/index';
import { STATISTICS } from '#shared/ehentai/statistics';
import { NamespaceName, RepoData, TagType } from '#shared/interfaces/ehtag';
import { Context, Logger } from '#shared/markdown/index';
import type { RawTag } from '#shared/raw-tag';
import { action } from '../../utils.js';

function gzip(data: string): Buffer {
    return zlib.gzipSync(data, {
        level: zlib.constants.Z_MAX_LEVEL,
        memLevel: zlib.constants.Z_MAX_MEMLEVEL,
        windowBits: zlib.constants.Z_MAX_WINDOWBITS,
        info: false,
    });
}

async function write(filename: string, data: Buffer | string): Promise<void> {
    if (typeof data == 'string') data = Buffer.from(data);
    await fs.writeFile(filename, data);
    console.log(`Created: ${filename} (${data.byteLength} bytes)`);
}

async function save(data: RepoData<unknown>, type: TagType): Promise<void> {
    const json = JSON.stringify(data);
    await write(`db.${type}.json`, json);

    const gz = gzip(json);
    await write(`db.${type}.json.gz`, gz);

    const flate = await fs.readFile(path.resolve(fileURLToPath(import.meta.url), '../flate.js'), 'utf-8');
    const jsonp = flate
        .replace('__EH_TOOL_RELEASE_DATA__', gz.toString('base64'))
        .replace('__EH_TOOL_RELEASE_CALLBACK__', `"load_ehtagtranslation_db_${type}"`);
    await write(`db.${type}.js`, jsonp);
}

async function createRelease(db: Database, destination: string): Promise<void> {
    console.log('Building releases...');
    console.log(`  Source: ${db.repoPath}`);
    console.log(`  Destination: ${destination}`);

    const types = ['full', 'raw', 'text', 'html', 'ast'] as const;
    const data = {} as Record<(typeof types)[number], RepoData<unknown>>;
    for (const k of types) {
        data[k] = await db.render(k);
    }

    const old = process.cwd();
    await fs.ensureDir(destination);
    process.chdir(destination);
    action.isAction() ? action.startGroup('files') : console.log(``);
    for (const k of types) {
        await save(data[k], k);
    }
    action.isAction() ? action.endGroup() : console.log(``);
    process.chdir(old);
}

function clearLine(): void {
    process.stderr.write(``.padEnd(clc.windowSize.width - 1) + clc.move.lineBegin);
}

const SOURCE_CHECK_NOTICE = new Set<NamespaceName>(['rows', 'reclass', 'male', 'female', 'mixed', 'other']);

async function runSourceCheck(db: Database, checkedNs: readonly NamespaceName[]): Promise<void> {
    /** 是否跳过 */
    function skipNs(ns: NamespaceName | 'temp'): ns is 'rows' | 'temp' {
        if (ns === 'rows' || ns === 'temp') return true;
        if (!checkedNs.includes(ns)) return true;
        return false;
    }

    console.log('\n从 E 站标签数据库检查标签...\n');
    const tagFromEh = await getTagGroups();
    console.log(`从 tag group 工具预加载了 ${tagFromEh.length} 个标签`);
    const tagFromEtt = new Set<`${NamespaceName}:${RawTag}`>();
    for (const k in db.data) {
        const ns = k as NamespaceName;
        if (skipNs(ns)) continue;
        const nsDb = db.data[ns];
        for (const [tag] of nsDb.raw()) {
            tagFromEtt.add(`${ns}:${tag}`);
        }
    }
    console.log(`从数据库加载了 ${tagFromEtt.size} 个标签`);
    let count = 0;
    const showProgress = process.stderr.isTTY && clc.windowSize.width > 0;
    for (const k in db.data) {
        const ns = k as NamespaceName;
        if (skipNs(ns)) continue;

        const nsDb = db.data[ns];
        for (const [tag, tagLine] of nsDb.raw()) {
            count++;
            if (showProgress) {
                clearLine();
                progress(count, `${ns}:${tag}`);
                process.stderr.write(clc.move.lineBegin);
            }

            const context = (): Context => {
                const c = new Context(tagLine.record, tag);
                c.line = tagLine.line;
                return c;
            };

            const normTag = await normalizeTag(ns, tag);
            if (normTag == null) {
                if (showProgress) {
                    clearLine();
                }
                db.logger[SOURCE_CHECK_NOTICE.has(ns) ? 'info' : 'warn'](context(), '未找到标签');
                continue;
            }
            if (normTag[1] !== tag) {
                if (showProgress) {
                    clearLine();
                }
                db.logger.warn(context(), `标签重命名 => ${normTag[0]}:${normTag[1]}`);
                continue;
            }
        }

        if (!showProgress) {
            progress(
                count,
                `完成 ${ns} 的检查，调用标签建议 ${STATISTICS.tagSuggest} 次，标签搜索 ${STATISTICS.tagSearch} 次`,
            );
            process.stderr.write(`\n`);
        }
    }

    for (const tag of tagFromEh) {
        if (skipNs(tag.namespace)) continue;
        if (!SOURCE_CHECK_NOTICE.has(tag.namespace)) continue;

        if (tagFromEtt.has(`${tag.namespace}:${tag.raw}`)) continue;
        const nsDb = db.data[tag.namespace];
        db.logger.warn(new Context(nsDb, tag.raw), '标签在 E 站标签数据库中存在，但未找到翻译');
    }
    console.log(`完成检查，调用标签建议 ${STATISTICS.tagSuggest} 次，标签搜索 ${STATISTICS.tagSearch} 次`);
    console.log('');

    function progress(count: number, message: string): void {
        const size = tagFromEtt.size;
        const sizeWidth = Math.floor(Math.log10(size)) + 1;
        let formatted = `[${count.toString().padStart(sizeWidth)}/${size}] ${message}`;
        if (clc.windowSize.width - 10 > formatted.length) {
            formatted = formatted.padEnd(clc.windowSize.width - 10);
        }
        process.stderr.write(`${formatted} ${((count / size) * 100).toFixed(3)}%`);
    }
}

class ActionLogger extends Logger {
    static override buildMessage(logger: keyof Logger, context: Context, message: string): string {
        return `${context.namespace.name}:${context.raw ?? '<unknown raw>'}: ${message}`;
    }
    readonly map: Record<keyof Logger, typeof notice> = {
        info: notice,
        warn: warning,
        error: error,
    };
    protected log(logger: 'info' | 'warn' | 'error', context: Context, message: string): void {
        this.map[logger](ActionLogger.buildMessage(logger, context, message), {
            file: `database/${context.namespace.name}.md`,
            startLine: context.line,
            startColumn: context.line ? context.column : undefined,
        });
        if (this.setFailed[logger]) {
            process.exitCode = action.ExitCode.Failure;
        }
    }
    readonly setFailed: Record<keyof Logger, boolean> = {
        info: false,
        warn: false,
        error: true,
    };

    constructor(readonly failed: keyof Logger = 'error') {
        super();
        switch (failed) {
            case 'info':
                this.setFailed.info = true;
            // fall through
            case 'warn':
                this.setFailed.warn = true;
            // fall through
            case 'error':
                this.setFailed.error = true;
        }
    }
}

class FileLogger extends Logger {
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

program
    .command('create-release')
    .description('生成发布文件')
    .argument('[source]', 'REPO 的本地路径')
    .argument('[destination]', '生成发布文件的路径')
    .option('--strict', '启用严格检查')
    .option('--source-check [ns]', '检查 E 站标签数据库，提示不存在的和重命名的标签')
    .option('--no-rewrite', '不重新序列化数据库内容')
    .action(
        async (
            source: string | undefined,
            destination: string | undefined,
            options: {
                strict: boolean;
                rewrite: boolean;
                sourceCheck: string | boolean;
            },
        ) => {
            source = path.resolve(source ?? '.');
            destination = path.resolve(destination ?? path.join(source, 'publish'));
            const { strict, rewrite, sourceCheck } = options;
            const db = await Database.create(
                source,
                undefined,
                action.isAction() ? new ActionLogger(strict ? 'warn' : 'error') : new FileLogger(source),
            );
            if (sourceCheck || typeof sourceCheck == 'string') {
                const checkNs: NamespaceName[] = [];
                if (sourceCheck && typeof sourceCheck == 'string') {
                    for (const ns of sourceCheck.split(/[,;:\s]/)) {
                        if (!ns) continue;
                        const nsName = parseNamespace(ns);
                        if (!nsName) {
                            console.error(`无效的命名空间 ${ns}`);
                            process.exitCode = 2;
                            return;
                        }
                        checkNs.push(nsName);
                    }
                    console.log(`检查命名空间 ${checkNs.join(', ')}`);
                } else {
                    checkNs.push(...NamespaceName);
                }
                await runSourceCheck(db, checkNs);
            }
            await createRelease(db, destination);
            if (rewrite) {
                await db.save();
            }
        },
    );
