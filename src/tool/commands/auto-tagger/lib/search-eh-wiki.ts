import { get } from '../../../../shared/ehentai/http';
import type { RawTag } from '../../../../shared/raw-tag';

export async function searchEhWiki(tag: RawTag): Promise<string | undefined> {
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

    const content = result.data.query.pages[0].revisions?.[0].slots.main.content;
    if (!content) {
        console.log(`未找到 EhWiki 条目“${result.data.query.pages[0].title}”`);
        return undefined;
    }

    const jp = /^\*'''Japanese''': (.+)$/m.exec(content)?.[1];
    if (!jp) {
        console.log(`找到 EhWiki 条目“${result.data.query.pages[0].title}”`);
    } else {
        console.log(`找到 EhWiki 条目“${result.data.query.pages[0].title}”及日文翻译“${jp}”`);
    }

    return jp;
}
