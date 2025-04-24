import { STATISTICS } from '#shared/ehentai/statistics';

export function withStatistics(value: string): string {
    if (STATISTICS.tagSuggest === 0 && STATISTICS.galleryList === 0 && STATISTICS.tagSearch === 0) return value;
    const phases = [value];
    if (STATISTICS.tagSuggest > 0) {
        phases.push(`标签建议 ${STATISTICS.tagSuggest} 次`);
    }
    if (STATISTICS.galleryList > 0) {
        phases.push(`图库信息 ${STATISTICS.galleryList} 次`);
    }
    if (STATISTICS.tagSearch > 0) {
        phases.push(`标签搜索 ${STATISTICS.tagSearch} 次`);
    }
    return `调用` + phases.join('，');
}
