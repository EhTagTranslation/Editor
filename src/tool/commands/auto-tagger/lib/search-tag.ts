import { decodeHTML } from 'entities';
import { get } from '../../../../shared/ehentai/http';
import type { NamespaceName } from '../../../../shared/interfaces/ehtag';
import type { RawTag } from '../../../../shared/raw-tag';

interface MatchRoot {
    convention?: string;
    creator?: string;
    name?: string;
    parody?: string;
    etc?: string;
}

interface Gallery {
    title: string;
    parsed: {
        convention?: string;
        creator?: string;
        group?: string;
        artist?: string;
        name: string;
        parody?: string;
        etc: string[];
    };
}

export async function searchTag(ns: NamespaceName, raw: RawTag): Promise<Gallery[]> {
    const content = (await get<string>(`https://exhentai.org/tag/${ns}:${raw}`)).data;

    const galleries = [];
    for (const m of content.matchAll(/<img style="[^"]+" alt="([^"]+)" title="\1" src="[^"]+" \/>/g)) {
        const title = decodeHTML(m[1]);
        const matchRoot =
            /^(\((?<convention>[^)]+)\) ){0,1}(\[(?<creator>[^\]]+)\] ){0,1}(?<name>.+?)($| )(\((?<parody>[^)]+)\)($| )){0,1}(?<etc>(\[([^\]]+)\]($| ))*)$/.exec(
                title,
            )?.groups as MatchRoot;
        const etc = [...(matchRoot.etc ?? '').matchAll(/(\[[^\]]+\])($| )/g)].map((m) => m[1]);
        galleries.push({
            title,
            parsed: {
                name: title,
                ...matchRoot,
                etc,
            },
        });
    }
    return galleries;
}
