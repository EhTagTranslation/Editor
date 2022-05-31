import { get } from '../../../../shared/ehentai/http';
import type { RawTag } from '../../../../shared/raw-tag';

const MediaType = ['game', 'movie', 'novel', 'anime/manga'] as const;
export type MediaType = typeof MediaType[number];

const MediaTypeMap: Record<string, MediaType> = {
    'video game': 'game',
    movie: 'movie',
    novel: 'novel',
    'anime/manga': 'anime/manga',
    anime: 'anime/manga',
    manga: 'anime/manga',
};

export async function searchEhWiki(
    tag: RawTag,
): Promise<[lang: 'zh' | 'ja' | 'en', mediaTypes: MediaType[], text: string] | undefined> {
    const result = await get<{
        query: {
            pages: [
                {
                    pageid: number;
                    title: string;
                    revisions: [
                        {
                            slots: {
                                main: {
                                    content: string;
                                };
                            };
                        },
                    ];
                },
            ];
        };
    }>(
        `https://ehwiki.org/api.php?action=query&redirect&prop=revisions&rvslots=*&rvprop=content&format=json&formatversion=2&titles=${encodeURIComponent(
            tag,
        )}`,
    );

    const title = result.data.query.pages[0].title;
    const content = result.data.query.pages[0].revisions?.[0].slots.main.content;
    if (!content) {
        console.log(`未找到 EhWiki 条目“${title}”`);
        return undefined;
    }

    const mediaTypes: MediaType[] = [];
    const type = /^\*'''Type''': (.+)$/m.exec(content)?.[1];
    if (type) {
        for (const mt of type.split(',')) {
            const mtTrimmed = mt.trim().toLowerCase();
            if (mtTrimmed in MediaTypeMap) {
                mediaTypes.push(MediaTypeMap[mtTrimmed]);
            }
        }
    }

    const zh = /^\*'''Chinese''': (.+)$/m.exec(content)?.[1];
    if (zh) {
        console.log(`找到 EhWiki 条目“${title}”（${mediaTypes.join(', ')}）及汉语翻译“${zh}”`);
        return ['zh', mediaTypes, zh];
    }
    const ja = /^\*'''Japanese''': (.+)$/m.exec(content)?.[1];
    if (ja) {
        console.log(`找到 EhWiki 条目“${title}”（${mediaTypes.join(', ')}）及日语翻译“${ja}”`);
        return ['ja', mediaTypes, ja];
    }
    const en = /^\*'''English''': (.+)$/m.exec(content)?.[1];
    if (en) {
        console.log(`找到 EhWiki 条目“${title}”（${mediaTypes.join(', ')}）及英语翻译“${en}”`);
        return ['en', mediaTypes, en];
    }
    console.log(`未找到 EhWiki 条目“${title}”（${mediaTypes.join(', ')}）的任何翻译，视标题为英语`);
    return ['en', mediaTypes, title];
}
