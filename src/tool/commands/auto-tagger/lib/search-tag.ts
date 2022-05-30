import { decodeHTML } from 'entities';
import { get, api, ApiRequest } from '../../../../shared/ehentai/http';
import type { NamespaceName } from '../../../../shared/interfaces/ehtag';
import type { RawTag } from '../../../../shared/raw-tag';

interface GMetadata {
    gid: number;
    token: string;
    archiver_key: string;
    title: string;
    title_jpn?: string;
    category: string;
    thumb: string;
    uploader: string;
    posted: string;
    filecount: number;
    filesize: number;
    expunged: boolean;
    rating: number;
    torrentcount: number;
    torrents: Array<{
        hash: string;
        added: string;
        name: string;
        tsize: number;
        fsize: number;
    }>;
    tags: string[];
}

interface GDataApiRequest extends ApiRequest<'gdata', { gmetadata: GMetadata[] }> {
    gidlist: Array<[gid: number, gtoken: string]>;
    namespace: 1;
}

interface MatchRoot {
    convention?: string;
    creator?: string;
    name?: string;
    parody?: string;
    etc?: string;
}

interface ParsedTitle {
    convention?: string;
    creator?: string;
    group?: string;
    artist?: string;
    name: string;
    parody?: string;
    etc: string[];
}

export interface Gallery extends GMetadata {
    parsed: ParsedTitle;
    parsed_jpn: ParsedTitle;
}

function parseTitle(title: string): ParsedTitle {
    title = title.trim();
    const matchRoot: MatchRoot =
        /^(\((?<convention>[^)]+)\) ){0,1}(\[(?<creator>[^\]]+)\] ){0,1}(?<name>.+?)($| )(\((?<parody>[^)]+)\)($| )){0,1}(?<etc>(\[([^\]]+)\]($| ))*)$/.exec(
            title,
        )?.groups ?? {};
    const etc = [...(matchRoot.etc ?? '').matchAll(/\[([^\]]+)\]($| )/g)].map((m) => m[1]);

    const creator = matchRoot.creator && /^(.+?) \((.+?)\)$/.exec(matchRoot.creator);
    return {
        name: title,
        ...matchRoot,
        group: creator ? creator[1] : undefined,
        artist: creator ? creator[2] : undefined,
        etc,
    };
}

export async function searchTag(ns: NamespaceName, raw: RawTag, page = 0): Promise<Gallery[]> {
    const content = (await get<string>(`https://exhentai.org/tag/${ns}:${raw}/${page}`)).data;
    const gidlist = [
        ...new Map(
            [...content.matchAll(/<a href="https:\/\/exhentai\.org\/g\/(\d+)\/(\w+)\/">/g)].map(([, gid, gtoken]) => [
                +gid,
                gtoken,
            ]),
        ),
    ];
    if (gidlist.length === 0) return [];
    const gData = (
        await api<GDataApiRequest>({
            method: 'gdata',
            namespace: 1,
            gidlist,
        })
    ).gmetadata;

    return gData.map((g) => {
        const title = decodeHTML(g.title);
        const title_jpn = decodeHTML(g.title_jpn ?? '');
        return {
            ...g,
            title,
            title_jpn,
            parsed: parseTitle(title),
            parsed_jpn: parseTitle(title_jpn),
        };
    });
}
