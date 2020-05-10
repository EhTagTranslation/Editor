import { Injectable, EventEmitter } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ApiEndpointService } from './api-endpoint.service';
import { GithubRelease, GithubReleaseAsset } from 'src/interfaces/github';
import { DebugService } from './debug.service';
import { TagType, RepoData, Tag } from 'src/interfaces/ehtag';
import { of, BehaviorSubject, merge, timer, from, Observable } from 'rxjs';
import { map, tap, mergeMap, catchError, filter, finalize, throttleTime } from 'rxjs/operators';
import { TagStore, TagRecord } from './TagStore';

function notUndef<T>(v: T | undefined): v is Exclude<T, undefined> {
    return v !== undefined;
}

@Injectable({
    providedIn: 'root',
})
export class GithubReleaseService {
    constructor(
        private readonly http: HttpClient,
        private readonly endpoints: ApiEndpointService,
        private readonly debug: DebugService,
    ) {
        this.fillCache('full');
        this.fillCache('raw');
        this.fillCache('html');
        this.fillCache('text');
        this.fillCache('ast');

        merge(this.refreshEvent, timer(0, 50_000))
            .pipe(
                throttleTime(100),
                tap((v) => this.debug.log('release: fetch start', v)),
                mergeMap((_) =>
                    this.getRelease().pipe(
                        map((data) => ({ data, hash: data.target_commitish })),
                        catchError((error) => of({ error })),
                    ),
                ),
                tap((v) => this.debug.log('release: fetch end', v)),
                map((v) => ('data' in v ? v.data : undefined)),
                filter(notUndef),
            )
            .subscribe((release) => this.getTags(release));
    }

    private refreshEvent = new EventEmitter<number>(true);

    private db = new TagStore();

    private readonly tagsData = {
        raw: new BehaviorSubject<TagRecord<'raw'> | undefined>(undefined),
        html: new BehaviorSubject<TagRecord<'html'> | undefined>(undefined),
        text: new BehaviorSubject<TagRecord<'text'> | undefined>(undefined),
        ast: new BehaviorSubject<TagRecord<'ast'> | undefined>(undefined),
        full: new BehaviorSubject<TagRecord<'full'> | undefined>(undefined),
    };

    readonly tags = {
        raw: this.tagsData.raw.pipe(
            filter(notUndef),
            map((v) => v.data),
        ),
        html: this.tagsData.html.pipe(
            filter(notUndef),
            map((v) => v.data),
        ),
        text: this.tagsData.text.pipe(
            filter(notUndef),
            map((v) => v.data),
        ),
        ast: this.tagsData.ast.pipe(
            filter(notUndef),
            map((v) => v.data),
        ),
        full: this.tagsData.full.pipe(
            filter(notUndef),
            map((v) => v.data),
        ),
    };

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
    private set<T extends TagType>(type: T, value: TagRecord<T>): void {
        (this.tagsData[type] as BehaviorSubject<TagRecord<T> | undefined>).next(value);
    }
    private get<T extends TagType>(type: T): TagRecord<T> | undefined {
        return (this.tagsData[type] as BehaviorSubject<TagRecord<T> | undefined>).value;
    }
    private jsonpLoad(asset: GithubReleaseAsset): Promise<RepoData<TagType>> {
        return new Promise<RepoData<TagType>>((resolve, reject) => {
            const callbackName = 'load_ehtagtranslation_' + asset.name.split('.').splice(0, 2).join('_');
            if (callbackName in globalThis) {
                reject(new Error(`Callback ${callbackName} has registered.`));
                return;
            }
            let timeoutGuard: ReturnType<typeof setTimeout> | undefined = undefined;

            const script = document.createElement('script');
            script.setAttribute('src', asset.browser_download_url);

            const close = (): void => {
                document.head.removeChild(script);
                timeoutGuard && clearTimeout(timeoutGuard);
                Reflect.deleteProperty(globalThis, callbackName);
            };

            timeoutGuard = setTimeout(() => {
                reject(new Error(`Get ${asset.name} timeout`));
                close();
            }, 60 * 1000);

            if (
                !Reflect.defineProperty(globalThis, callbackName, {
                    value: (data: RepoData<TagType>) => {
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

    private transformAndStore<T extends Exclude<TagType, 'full'>>(type: T): boolean {
        const fullData = this.get('full');
        if (!fullData) {
            return false;
        }
        const data: TagRecord<T> = {
            hash: fullData.hash,
            type: type,
            data: {
                ...fullData.data,
                data: fullData.data.data.map((fullNs) => {
                    const mappedData: { [raw: string]: Tag<T> } = {};
                    for (const key in fullNs.data) {
                        const element = fullNs.data[key];
                        mappedData[key] = {
                            name: element.name[type],
                            intro: element.intro[type],
                            links: element.links[type],
                        } as Tag<T>;
                    }
                    return {
                        ...fullNs,
                        data: mappedData,
                    };
                }),
            },
        };

        this.set(type, data);
        this.db.data.put(data);
        this.debug.log('release: store transformed data', { type, hash: fullData.hash });
        return true;
    }

    private async fillCache(type: TagType): Promise<void> {
        try {
            const data = await this.db.data.get(type);
            if (data) {
                this.debug.log('release: init with db data', { type, hash: data.hash });
                this.set(type, data);
            } else {
                if (type !== 'full' && this.transformAndStore(type)) {
                    const fullData = this.get('full');
                    if (!fullData) {
                        throw Error('assertion failed');
                    }
                    this.debug.log('release: init with transformed data', { type, hash: fullData.hash });
                } else {
                    this.debug.log('release: init skipped, no db data', { type });
                }
            }
        } catch (error) {
            this.debug.log('release: init failed', { type, error });
        }
    }

    private async getTags(release: GithubRelease): Promise<void> {
        const type: TagType = 'full';
        const cacheData = this.get(type);
        if (cacheData && cacheData.hash === release.target_commitish) {
            return;
        }

        this.debug.log('release: load start', { type, hash: release.target_commitish });
        const dbData = await this.db.data.get(type);
        if (dbData && dbData.hash === release.target_commitish) {
            this.debug.log('release: load end with db data', { type, hash: dbData.hash });
            this.set(type, dbData);
            return;
        }

        const asset = release.assets.find((i) => i.name === `db.${type}.js`);
        if (!asset) {
            throw new Error('Github release asset not found!');
        }

        const req = this.jsonpLoad(asset);
        if (req.isRejected()) {
            this.debug.log('release: load canceled', { type, hash: release.target_commitish });
            return;
        }
        const data: TagRecord<'full'> = {
            type,
            data: await req,
            hash: release.target_commitish,
        };
        this.debug.log('release: load end with remote data', { type, hash: data.hash });
        this.set(type, data);
        this.db.data.put(data);

        this.transformAndStore('ast');
        this.transformAndStore('text');
        this.transformAndStore('html');
        this.transformAndStore('raw');
    }
}
