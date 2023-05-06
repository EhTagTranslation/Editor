import clc from 'cli-color';
import type { Database } from '#shared/database';
import { getTagGroups, normalizeTag } from '#shared/ehentai/index';
import { STATISTICS } from '#shared/ehentai/statistics';
import type { NamespaceName } from '#shared/interfaces/ehtag';
import { Context } from '#shared/markdown/index';
import type { RawTag } from '#shared/raw-tag';

function clearLine(): void {
    process.stderr.write(``.padEnd(clc.windowSize.width - 1) + clc.move.lineBegin);
}

const SOURCE_CHECK_NOTICE = new Set<NamespaceName>(['rows', 'reclass', 'male', 'female', 'mixed', 'other']);

export async function runSourceCheck(db: Database, checkedNs: readonly NamespaceName[]): Promise<void> {
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
