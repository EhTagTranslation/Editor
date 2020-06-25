import { Injectable, isDevMode } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError, combineLatest, concat, OperatorFunction } from 'rxjs';
import { map, tap, catchError, filter, shareReplay } from 'rxjs/operators';
import { ETKey } from '../interfaces/ehtranslation';
import { ApiEndpointService } from './api-endpoint.service';
import { DebugService } from './debug.service';
import { TagType, CellType, Tag, RepoData, NamespaceName, FrontMatters } from 'browser/interfaces/ehtag';
import { GithubReleaseService } from './github-release.service';
import { LocalStorageService } from './local-storage.service';

const EH_TAG_HASH = 'eh-tag-hash';

function mapStatusCodeTo<R, T>(status: number, v: T): OperatorFunction<R, R | T> {
    return catchError<R, Observable<T>>((ex) => (ex.status === status ? of(v) : throwError(ex)));
}

@Injectable({
    providedIn: 'root',
})
export class EhTagConnectorService {
    // https://ehtagconnector.azurewebsites.net/api/database
    constructor(
        private readonly http: HttpClient,
        private readonly endpoints: ApiEndpointService,
        private readonly release: GithubReleaseService,
        private readonly debug: DebugService,
        private readonly localStorage: LocalStorageService,
    ) {
        combineLatest([release.tags.raw, release.tags.raw])
            .pipe(filter((v) => v[0].head.sha === v[1].head.sha))
            .subscribe((v) => this.fillCache(v[0], v[1], 'raw'));
        combineLatest([release.tags.raw, release.tags.html])
            .pipe(filter((v) => v[0].head.sha === v[1].head.sha))
            .subscribe((v) => this.fillCache(v[0], v[1], 'html'));
        combineLatest([release.tags.raw, release.tags.text])
            .pipe(filter((v) => v[0].head.sha === v[1].head.sha))
            .subscribe((v) => this.fillCache(v[0], v[1], 'text'));
        combineLatest([release.tags.raw, release.tags.ast])
            .pipe(filter((v) => v[0].head.sha === v[1].head.sha))
            .subscribe((v) => this.fillCache(v[0], v[1], 'ast'));
        combineLatest([release.tags.raw, release.tags.full])
            .pipe(filter((v) => v[0].head.sha === v[1].head.sha))
            .subscribe((v) => this.fillCache(v[0], v[1], 'full'));

        const fallback: Record<NamespaceName, Omit<FrontMatters, 'key'>> = {
            rows: { name: '行名', description: '标签列表的行名，即标签的命名空间。' },
            artist: { name: '艺术家', description: '绘画作者 / Coser。' },
            female: { name: '女性', description: '女性角色相关的恋物标签。' },
            male: { name: '男性', description: '男性角色相关的恋物标签。' },
            parody: { name: '原作', description: '同人作品模仿的原始作品。' },
            character: { name: '角色', description: '作品中出现的角色。' },
            group: { name: '团队', description: '制作社团或公司。' },
            language: { name: '语言', description: '作品的语言。' },
            reclass: {
                name: '重新分类',
                description: '用于分类出错的画廊，当某个重新分类标签权重达到 100，将移动画廊至对应分类。',
            },
            misc: {
                name: '杂项',
                description:
                    '两性/中性的恋物标签或没有具体分类的标签，可以在论坛发帖请求管理员添加新的标签或将标签移动到正确分类。',
            },
        };
        this.namespaceInfo = concat(
            of(fallback),
            release.tags.full.pipe(
                map((v) => {
                    const data: Partial<Record<NamespaceName, Omit<FrontMatters, 'key'>>> = {};
                    v.data.forEach((d) => (data[d.namespace] = d.frontMatters));
                    return data as Record<NamespaceName, Omit<FrontMatters, 'key'>>;
                }),
            ),
        ).pipe(shareReplay(1));

        if (isDevMode()) {
            (globalThis as any).setHash = (hash: string) => (this.hash = hash);
        }
    }

    readonly namespaceInfo: Observable<Record<NamespaceName, Omit<FrontMatters, 'key'>>>;

    private readonly hashStorage = this.localStorage.get(EH_TAG_HASH);
    readonly hashChange = this.hashStorage.valueChange;
    get hash(): string | null {
        return this.hashStorage.value;
    }
    set hash(value: string | null) {
        this.hashStorage.value = value;
    }

    private readonly normalizeCache = {
        raw: new Map<string, CellType<'raw'>>(),
        html: new Map<string, CellType<'html'>>(),
        text: new Map<string, CellType<'text'>>(),
        ast: new Map<string, CellType<'ast'>>(),
        full: new Map<string, CellType<'full'>>(),
    };

    private fillCache<T extends TagType>(dataRaw: RepoData<'raw'>, data: RepoData<T>, format: T): void {
        const cacheMap = this.normalizeCache[format] as Map<string, CellType<T>>;
        for (const ns of data.data) {
            const nsRaw = dataRaw.data.find((n) => n.namespace === ns.namespace);
            if (!nsRaw) {
                continue;
            }
            for (const key in ns.data) {
                const element = ns.data[key];
                const elementRaw = nsRaw.data[key];
                cacheMap.set(elementRaw.name, element.name);
                cacheMap.set(elementRaw.intro, element.intro);
                cacheMap.set(elementRaw.links, element.links);
            }
        }
    }

    private localRender<T extends TagType>(source: string, format: T): CellType<T> | undefined {
        if (format === 'ast' || format === 'full') {
            return undefined;
        }
        const haveOne = (data: string, ch: string): boolean => {
            return data.includes(ch);
        };
        const haveTwo = (data: string, ch: string): boolean => {
            return data.indexOf(ch) !== data.lastIndexOf(ch);
        };
        const havePair = (data: string, l: string, r: string): boolean => {
            return data.indexOf(l) < data.indexOf(r);
        };
        const handlePara = (lines: readonly string[]): string | undefined => {
            const joined = lines.join('\n');
            if (haveOne(joined, 'http://') || haveOne(joined, 'https://') || haveOne(joined, 'www.')) {
                return undefined;
            }
            if (
                haveOne(joined, '\\') ||
                haveTwo(joined, '~') ||
                haveTwo(joined, '_') ||
                haveTwo(joined, '*') ||
                haveTwo(joined, '`')
            ) {
                return undefined;
            }
            if (havePair(joined, '<', '>') || havePair(joined, '[', ']')) {
                return undefined;
            }
            if (format === 'raw' || format === 'text') {
                return joined;
            }
            return '<p>' + lines.join('<br>\n') + '</p>';
        };
        const paras: string[][] = [];
        const spaces: number[] = [0];
        let pending: string[] | null = null;
        for (const line of source.split('\n').map((l) => l.trim())) {
            if (line.length === 0) {
                if (pending === null) {
                    spaces[spaces.length - 1]++;
                } else {
                    paras.push(pending);
                    pending = null;
                    spaces[spaces.length] = 0;
                }
            } else {
                if (pending === null) {
                    pending = [line];
                } else {
                    pending.push(line);
                }
            }
        }
        if (pending !== null) {
            paras.push(pending);
            pending = null;
            spaces[spaces.length] = 0;
        }
        const handledParas = paras.map(handlePara);
        if (handledParas.includes(undefined)) {
            return undefined;
        }
        if (format === 'raw') {
            return spaces.reduce<string>(
                (str, sp, idx) => str + '\n'.repeat(sp) + (handledParas[idx] ?? ''),
                '',
            ) as CellType<T>;
        }
        return handledParas.join('\n') as CellType<T>;
    }

    private getEndpoint(item: ETKey, format: TagType): string {
        if (format === 'full') {
            return this.endpoints.ehTagConnectorDb(`${item.namespace}/${item.raw.trim().toLowerCase()}?format=json`);
        }
        return this.endpoints.ehTagConnectorDb(
            `${item.namespace}/${item.raw.trim().toLowerCase()}?format=${format}.json`,
        );
    }

    updateHash(): Observable<void> {
        const endpoint = this.endpoints.ehTagConnectorDb();
        return this.http.head<void>(endpoint);
    }

    getTag<T extends TagType = 'raw'>(key: ETKey, format: T = 'raw' as T): Observable<Tag<T> | null> {
        const endpoint = this.getEndpoint(key, format);
        return this.http.get<Tag<T>>(endpoint).pipe(mapStatusCodeTo(404, null));
    }
    addTag<T extends TagType = 'raw'>(
        key: ETKey,
        value: Tag<'raw'>,
        format: T = 'raw' as T,
    ): Observable<Tag<T> | null> {
        const endpoint = this.getEndpoint(key, format);
        const payload: Tag<'raw'> = {
            intro: value.intro,
            name: value.name,
            links: value.links,
        };
        return this.http.post<Tag<T>>(endpoint, payload).pipe(mapStatusCodeTo(409, null));
    }
    hasTag(item: ETKey): Observable<boolean> {
        const endpoint = this.getEndpoint(item, 'full');
        return this.http.head(endpoint).pipe(
            map((_) => true),
            mapStatusCodeTo(404, false),
        );
    }
    modifyTag<T extends TagType = 'raw'>(
        key: ETKey,
        value: Tag<'raw'>,
        format: T = 'raw' as T,
    ): Observable<Tag<T> | null> {
        const endpoint = this.getEndpoint(key, format);
        const payload: Tag<'raw'> = {
            intro: value.intro,
            name: value.name,
            links: value.links,
        };
        return this.http.put<Tag<T>>(endpoint, payload).pipe(mapStatusCodeTo(404, null));
    }
    deleteTag(key: ETKey): Observable<boolean> {
        const endpoint = this.getEndpoint(key, 'full');
        return this.http.delete<void>(endpoint).pipe(
            map((_) => true),
            mapStatusCodeTo(404, false),
        );
    }

    normalizeTag<T extends TagType = 'raw'>(item: Tag<'raw'>, format: T = 'raw' as T): Observable<Tag<T>> {
        const payload: Tag<'raw'> = {
            intro: item.intro,
            name: item.name,
            links: item.links,
        };
        const cache = this.normalizeCache[format] as Map<string, CellType<T>>;
        const cachedName = cache.get(item.name);
        const cachedIntro = cache.get(item.intro);
        const cachedLinks = cache.get(item.links);
        if (
            typeof cachedIntro !== 'undefined' &&
            typeof cachedName !== 'undefined' &&
            typeof cachedLinks !== 'undefined'
        ) {
            return of({
                intro: cachedIntro,
                name: cachedName,
                links: cachedLinks,
            });
        }
        const localName = cachedName ?? this.localRender(item.name, format);
        const localIntro = cachedIntro ?? this.localRender(item.intro, format);
        const localLinks = cachedLinks ?? this.localRender(item.links, format);
        if (
            typeof localName !== 'undefined' &&
            typeof localIntro !== 'undefined' &&
            typeof localLinks !== 'undefined'
        ) {
            return of({
                name: localName as CellType<T>,
                intro: localIntro as CellType<T>,
                links: localLinks as CellType<T>,
            });
        }
        const endpoint =
            this.endpoints.ehTagConnectorTools('normalize') +
            (format === 'full' ? '?format=json' : `?format=${format}.json`);
        return this.http.post<Tag<T>>(endpoint, payload).pipe(
            tap((result) => {
                cache.set(item.name, result.name);
                cache.set(item.intro, result.intro);
                cache.set(item.links, result.links);
            }),
        );
    }
}
