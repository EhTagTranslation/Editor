import clc from 'cli-color';
import type { Database } from '#shared/database';
import { NamespaceName } from '#shared/interfaces/ehtag';
import { Context } from '#shared/markdown/index';
import type { RawTag } from '#shared/raw-tag';
import { withStatistics } from './statistics.js';
import { normalizeTag } from '../../normalize-tag.js';
import { getTagGroups } from '../../tag-groups-db.js';
import { getTagInfo } from '#tool/tag-dump-db';

function clearLine(): void {
    process.stderr.write(``.padEnd(clc.windowSize.width - 1) + clc.move.lineBegin);
}

function progress(count: number, total: number, message: string): void {
    const sizeWidth = Math.floor(Math.log10(total)) + 1;
    let formatted = `[${count.toString().padStart(sizeWidth)}/${total}] ${message}`;
    if (clc.windowSize.width - 10 > formatted.length) {
        formatted = formatted.padEnd(clc.windowSize.width - 10);
    }
    process.stderr.write(`${formatted} ${((count / total) * 100).toFixed(3)}%`);
}

export const SOURCE_CHECK_NS: readonly NamespaceName[] = [
    'rows',
    'reclass',
    'male',
    'female',
    'mixed',
    'other',
    'language',
    'cosplayer',
    'artist',
    'group',
    'parody',
    'character',
] as const satisfies { length: (typeof NamespaceName)['length'] };
const SOURCE_CHECK_NOTICE = new Set<NamespaceName>(['rows', 'reclass', 'male', 'female', 'mixed', 'other']);

function showProgress(): boolean {
    return process.stderr.isTTY && clc.windowSize.width > 0;
}

async function searchCheck(
    db: Database,
    tagFromEtt: Set<`${NamespaceName}:${RawTag}`>,
    skipNs: (ns: NamespaceName) => boolean,
): Promise<void> {
    let count = 0;
    for (const ns of SOURCE_CHECK_NS) {
        if (skipNs(ns)) continue;

        const nsDb = db.data[ns];
        for (const [tag, tagLine] of nsDb.raw()) {
            count++;
            if (showProgress()) {
                clearLine();
                progress(count, tagFromEtt.size, `${ns}:${tag}`);
                process.stderr.write(clc.move.lineBegin);
            }

            const context = (): Context => {
                const c = new Context(tagLine.record, tag);
                c.line = tagLine.line;
                return c;
            };
            const normTag = await normalizeTag(ns, tag);
            if (normTag == null) {
                if (showProgress()) {
                    clearLine();
                }
                db.logger[SOURCE_CHECK_NOTICE.has(ns) ? 'info' : 'warn'](context(), '未找到标签');
                continue;
            }
            if (normTag[1] !== tag) {
                if (showProgress()) {
                    clearLine();
                }
                db.logger.warn(context(), `标签重命名 => ${normTag[0]}:${normTag[1]}`);
                continue;
            }
        }

        if (!showProgress()) {
            progress(count, tagFromEtt.size, withStatistics(`完成 ${ns} 的检查`));
            process.stderr.write(`\n`);
        }
    }
}

export async function runSourceCheck(
    db: Database,
    options: {
        checkedNs?: readonly NamespaceName[];
        useSearch?: boolean;
    },
): Promise<void> {
    const checkedNs = options.checkedNs ?? NamespaceName;
    const useSearch = options.useSearch ?? true;
    console.log('\n开始 Source Check');

    /** 是否跳过 */
    function skipNs(ns: NamespaceName | 'temp'): ns is 'rows' | 'temp' {
        if (ns === 'rows' || ns === 'temp') return true;
        if (!checkedNs.includes(ns)) return true;
        return false;
    }

    const dbs = [getTagInfo('language', 'chinese' as RawTag), getTagGroups()] as const;
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

    const [, tagFromEh] = await Promise.all(dbs);

    if (useSearch) {
        await searchCheck(db, tagFromEtt, skipNs);
    }

    for (const tag of tagFromEh) {
        if (skipNs(tag.namespace)) continue;
        if (!SOURCE_CHECK_NOTICE.has(tag.namespace)) continue;

        if (tagFromEtt.has(`${tag.namespace}:${tag.raw}`)) continue;
        const nsDb = db.data[tag.namespace];
        db.logger.warn(new Context(nsDb, tag.raw), '标签在 E 站标签数据库中存在，但未找到翻译');
    }

    if (showProgress()) clearLine();
    console.log(withStatistics(`完成 Source Check`));
    console.log('');
}
