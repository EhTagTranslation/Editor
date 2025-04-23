import { createGunzip } from 'node:zlib';
import { createInterface } from 'node:readline/promises';
import type { Database } from '#shared/database';
import { get } from '#shared/ehentai/http/index';
import { isNamespaceName } from '#shared/namespace';
import { type RawTag, isRawTag } from '#shared/raw-tag';
import type { NamespaceName } from '#shared/interfaces/ehtag';
import { normalizeTag } from '#shared/ehentai/normalize-tag';

const CHECK_THRESHOLD = 500;

/** 计算标签覆盖 */
export async function runCoverage(db: Database): Promise<void> {
    const ref = await get('https://github.com/EhTagTranslation/EhTagDb/releases/latest/download/aggregated.sqlite.gz', {
        responseType: 'stream',
    });

    let allFreq = 0;
    let coveredFreq = 0;
    let allCount = 0;
    let coveredCount = 0;
    const uncovered: Array<[NamespaceName, RawTag, number]> = [];
    for await (const line of createInterface((ref.data as NodeJS.ReadableStream).pipe(createGunzip()))) {
        if (!line) continue;
        const [, countStr, tag] = line.split(',');
        if (!tag) continue;
        const count = Number(countStr);
        if (!count) continue;
        let [ns, raw] = tag.slice(1, -1).split(':') as [NamespaceName, RawTag];
        if (!isNamespaceName(ns) || !isRawTag(raw)) continue;

        if (count > CHECK_THRESHOLD && !db.data[ns].get(raw)) {
            const norm = await normalizeTag(ns, raw);
            if (norm) {
                ns = norm[0];
                raw = norm[1];
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
}
