import type { Database } from '#shared/database';
import type { RawTag } from '#shared/raw-tag';
import type { NamespaceName } from '#shared/interfaces/ehtag';
import { normalizeTag } from '../../normalize-tag.js';
import { getAllTagInfo } from '../../tag-dump-db.js';
import { withStatistics } from './statistics.js';

const CHECK_THRESHOLD = 500;

/** 计算标签覆盖 */
export async function runCoverage(db: Database, checkNs: readonly NamespaceName[]): Promise<void> {
    console.log('计算标签覆盖率...');
    const ref = await getAllTagInfo();

    let allFreq = 0;
    let coveredFreq = 0;
    let allCount = 0;
    let coveredCount = 0;
    const uncovered: Array<[NamespaceName, RawTag, number]> = [];
    for (const record of ref) {
        const { count, namespace, tag } = record;
        if (!checkNs.includes(namespace)) continue;
        let [ns, raw] = [namespace, tag];
        if (count > CHECK_THRESHOLD && !db.data[ns].get(raw)) {
            const norm = await normalizeTag(ns, raw);
            if (norm) {
                [ns, raw] = norm;
            }
        }

        if (!db.data[ns].get(raw)) {
            uncovered.push([ns, raw, count]);
        } else {
            coveredFreq += count;
            coveredCount++;
        }
        allFreq += count;
        allCount++;
    }

    uncovered.sort((a, b) => b[2] - a[2]);
    const toCoverageStr = (dividend: number, divisor: number): string =>
        `${dividend}/${divisor} (${((dividend / divisor) * 100).toFixed(2)}%)`;
    console.log(`标签覆盖 数量：${toCoverageStr(coveredCount, allCount)} 频率：${toCoverageStr(coveredFreq, allFreq)}`);
    console.log(`未覆盖 TOP 50/${uncovered.length}：`);
    for (let i = 0; i < uncovered.length && i < 50; i++) {
        const [ns, raw, count] = uncovered[i];
        const norm = await normalizeTag(ns, raw);
        if (norm) {
            if (ns === norm[0] && raw === norm[1]) {
                console.log(`  ${ns}:${raw} (${count})`);
            } else {
                console.log(`  [RENAMED] ${ns}:${raw} -> ${norm[0]}:${norm[1]} (${count})`);
            }
        } else {
            console.log(`  [INVALID] ${ns}:${raw} (${count})`);
        }
    }
    console.log(withStatistics('标签覆盖率计算完成'));
}
