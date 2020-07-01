import { Injectable, EventEmitter } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ApiEndpointService } from './api-endpoint.service';
import { GithubRelease } from 'browser/interfaces/github';
import { DebugService } from './debug.service';
import {
    TagType,
    RepoData,
    NamespaceInfo,
    NamespaceData,
    NamespaceName,
    FrontMatters,
    RepoInfo,
    Sha1Value,
} from 'shared/interfaces/ehtag';
import { of, BehaviorSubject, merge, timer, from, Observable } from 'rxjs';
import { map, tap, mergeMap, catchError, filter, finalize, throttleTime } from 'rxjs/operators';
import { CacheService } from './cache.service';
import { DatabaseView, NamespaceDatabaseView, Context } from 'shared/interfaces/database';
import { TagRecord } from 'shared/tag-record';
import { RawTag } from 'shared/validate';

function notUndef<T>(v: T | undefined): v is Exclude<T, undefined> {
    return v !== undefined;
}

class NamespaceDatabaseInMemory implements NamespaceDatabaseView {
    private static readonly fallback: Record<NamespaceName, Omit<FrontMatters, 'key'>> = {
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
    constructor(
        readonly database: DatabaseView,
        readonly namespace: NamespaceName,
        private readonly storage?: NamespaceData<'raw'>,
    ) {}

    get frontMatters(): Readonly<FrontMatters> {
        return (
            this.storage?.frontMatters ?? {
                ...NamespaceDatabaseInMemory.fallback[this.namespace],
                key: this.namespace,
            }
        );
    }
    info(): NamespaceInfo {
        return (
            this.storage ?? {
                namespace: this.namespace,
                count: 0,
                frontMatters: this.frontMatters,
            }
        );
    }
    render<T extends TagType>(type: T): NamespaceData<T> {
        if (!this.storage) {
            return {
                ...this.info(),
                data: {},
            };
        }
        if (type === 'raw') {
            return this.storage as NamespaceData<T>;
        }
        const data = {} as NamespaceData<T>['data'];
        const context = Context.create(this);
        for (const k in this.storage.data) {
            const key = k as RawTag;
            const tag = this.get(key);
            if (tag) {
                context.raw = key;
                data[key] = tag.render(type, context);
            }
        }
        return {
            ...this.info(),
            data,
        };
    }
    get size(): number {
        return this.storage?.count ?? 0;
    }
    get(raw: RawTag): TagRecord | undefined {
        const tag = this.storage?.data[raw];
        if (!tag) return undefined;
        return new TagRecord(tag, this);
    }
    has(raw: RawTag): boolean {
        const tag = this.storage?.data[raw];
        return !!tag;
    }
    get valid(): boolean {
        return this.storage != null;
    }
}

class DatabaseInMemory implements DatabaseView {
    constructor(
        private readonly cacheService: CacheService,
        private readonly storage?: RepoData<'raw'>,
        revision?: number,
    ) {
        this.revision = revision ?? -1;
        const data = {} as { [key in NamespaceName]: NamespaceDatabaseInMemory };
        for (const key of NamespaceName) {
            data[key] = new NamespaceDatabaseInMemory(
                this,
                key,
                storage?.data.find((d) => d.namespace === key),
            );
        }
        this.data = data;
    }
    get version(): number {
        return this.storage?.version ?? 5;
    }
    readonly data: { readonly [key in NamespaceName]: NamespaceDatabaseInMemory };

    info(): Promise<RepoInfo> {
        return Promise.resolve(
            this.storage ?? {
                repo: 'https://github.com/EhTagTranslation/Database.git',
                version: 5,
                head: {
                    sha: 'e80d454a22b126a9d7731ef5fc3ea0a0a665346c' as Sha1Value,
                    message: '',
                    author: {
                        name: 'author',
                        email: 'author@example.com',
                        when: new Date(0),
                    },
                    committer: {
                        name: 'committer',
                        email: 'committer@example.com',
                        when: new Date(0),
                    },
                },
                data: Object.values(this.data).map((d) => d.info()),
            },
        );
    }

    private readonly cache = {} as { [T in TagType]: RepoData<T> | undefined };
    async render<T extends TagType>(type: T): Promise<RepoData<T>> {
        console.time('render');
        const cached = this.cache[type] as RepoData<T> | undefined;
        if (cached) return Promise.resolve(cached);

        const cacheKey = `REPO_DATA_${type.toUpperCase()}`;
        const db = (await this.cacheService.get(cacheKey)) as RepoData<T> | undefined;
        if (db) {
            if (db.head.sha !== this.storage?.head.sha) {
                void this.cacheService.delete(cacheKey);
            } else {
                this.cache[type] = db as never;
                return db;
            }
        }
        const info = await this.info();
        const result = {
            ...info,
            data: Object.values(this.data).map((d) => d.render(type)),
        };
        this.cache[type] = result as never;
        void this.cacheService.set(cacheKey, result);
        return result;
    }

    get(raw: RawTag): TagRecord | undefined {
        for (const ns of NamespaceName) {
            const record = this.data[ns].get(raw);
            if (record) return record;
        }
        return undefined;
    }

    revision!: number;
    get valid(): boolean {
        return this.storage != null;
    }
}

@Injectable({
    providedIn: 'root',
})
export class GithubReleaseService {
    constructor(
        private readonly http: HttpClient,
        private readonly endpoints: ApiEndpointService,
        private readonly debug: DebugService,
        private readonly cache: CacheService,
    ) {
        void this.fillCache();

        merge(this.refreshEvent, timer(0, 50_000))
            .pipe(
                throttleTime(100),
                tap((v) => this.debug.log('release: fetch start', v)),
                mergeMap((_) =>
                    this.getRelease().pipe(
                        map((data) => ({ data, hash: data.target_commitish })),
                        catchError((error: Error) => of({ error })),
                    ),
                ),
                tap((v) => this.debug.log('release: fetch end', v)),
                map((v) => ('data' in v ? v.data : undefined)),
                filter(notUndef),
            )
            .subscribe((release) => {
                void this.getTags(release);
            });
    }

    private refreshEvent = new EventEmitter<number>(true);

    private readonly tagsData = new BehaviorSubject<DatabaseInMemory>(new DatabaseInMemory(this.cache));

    readonly tags = this.tagsData.asObservable();

    private getReleasePromise?: Promise<GithubRelease>;
    private getRelease(): Observable<GithubRelease> {
        const get = (): Promise<GithubRelease> => {
            const endpoint = this.endpoints.github('repos/EhTagTranslation/Database/releases/latest');
            return this.http.get<GithubRelease>(endpoint).toPromise();
        };
        if (this.getReleasePromise) {
            return from(this.getReleasePromise);
        }
        return from((this.getReleasePromise = get())).pipe(finalize(() => (this.getReleasePromise = undefined)));
    }
    refresh(): void {
        this.refreshEvent.next(-1);
    }
    private async set(value: RepoData<'raw'>): Promise<void> {
        await Promise.delay(0);
        const data = new DatabaseInMemory(this.cache, value, this.get().revision + 1);
        await data.render('full');
        await data.render('ast');
        await data.render('html');
        await data.render('raw');
        await data.render('text');
        this.tagsData.next(data);
    }
    private get(): DatabaseView {
        return this.tagsData.value;
    }
    private jsonpLoad(release: GithubRelease): Promise<RepoData<'raw'>> {
        const asset = release.assets.find((i) => i.name === `db.raw.js`);
        if (!asset) {
            throw new Error('Github release asset not found!');
        }
        const callbackName = 'load_ehtagtranslation_db_raw';
        if (callbackName in globalThis) {
            throw new Error(`Callback ${callbackName} has registered.`);
        }
        return new Promise<RepoData<'raw'>>((resolve, reject) => {
            let timeoutGuard: ReturnType<typeof setTimeout> | undefined = undefined;

            const script = document.createElement('script');
            script.setAttribute('src', asset.browser_download_url);

            const close = (): void => {
                document.head.removeChild(script);
                timeoutGuard && clearTimeout(timeoutGuard);
                timeoutGuard = undefined;
                Reflect.deleteProperty(globalThis, callbackName);
            };

            timeoutGuard = setTimeout(() => {
                reject(new Error(`Get ${asset.name} timeout`));
                close();
            }, 60_000);

            if (
                !Reflect.defineProperty(globalThis, callbackName, {
                    value: (data: RepoData<'raw'>) => {
                        resolve(data);
                        close();
                    },
                    writable: false,
                    configurable: true,
                })
            ) {
                reject(new Error(`Failed to register callback ${callbackName}.`));
                close();
                return;
            }
            document.head.appendChild(script);
        });
    }

    private async fillCache(): Promise<void> {
        try {
            const data = await this.cache.get('REPO_DATA_RAW');
            if (data) {
                this.debug.log('release: init with db data', { hash: data.head.sha });
                await this.set(data);
            } else {
                this.debug.log('release: init skipped, no db data');
            }
        } catch (error) {
            this.debug.log('release: init failed', { error: error as unknown });
        }
    }

    private async getTags(release: GithubRelease): Promise<void> {
        const cacheData = this.get();
        if (cacheData && (await cacheData.info()).head.sha === release.target_commitish) {
            return;
        }

        this.debug.log('release: load start', { hash: release.target_commitish });
        const dbData = await this.cache.get('REPO_DATA_RAW');
        if (dbData && dbData.head.sha === release.target_commitish) {
            this.debug.log('release: load end with db data', { hash: dbData.head.sha });
            await this.set(dbData);
            return;
        }
        const data = await this.jsonpLoad(release);
        this.debug.log('release: load end with remote data', { hash: data.head.sha });
        await this.set(data);
        await this.cache.set('REPO_DATA_RAW', data);
    }
}
