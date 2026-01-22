import { Injectable, EventEmitter } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ApiEndpointService } from './api-endpoint.service';
import type { GithubRelease } from '#browser/interfaces/github';
import { DebugService } from './debug.service';
import type { RepoData } from '#shared/interfaces/ehtag';
import { of, BehaviorSubject, merge, timer, from, Observable, lastValueFrom } from 'rxjs';
import { map, tap, mergeMap, catchError, filter, finalize, throttleTime } from 'rxjs/operators';
import { CacheService } from './cache.service';
import type { DatabaseView } from '#shared/interfaces/database';
import { DatabaseInMemory } from './database';
import { DB_REPO } from './database.shared';

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

    private readonly refreshEvent = new EventEmitter<number>(true);

    private readonly tagsData = new BehaviorSubject<DatabaseInMemory>(new DatabaseInMemory(this.cache));

    readonly tags = this.tagsData.asObservable();

    private getReleasePromise?: Promise<GithubRelease>;
    private getRelease(): Observable<GithubRelease> {
        const get = async (): Promise<GithubRelease> => {
            const endpoint = this.endpoints.github(`repos/${DB_REPO}/releases/latest`);
            return await lastValueFrom(this.http.get<GithubRelease>(endpoint));
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
        await new Promise((resolve) => setTimeout(resolve, 0));
        const data = new DatabaseInMemory(this.cache, value, this.get().revision + 1);
        this.debug.log('release: rendering');
        await data.render('full');
        await data.render('ast');
        await data.render('html');
        await data.render('raw');
        await data.render('text');
        this.debug.log('release: rendered');
        this.tagsData.next(data);
    }
    private get(): DatabaseView {
        return this.tagsData.value;
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
            this.debug.log('release: init failed', { error });
        }
    }

    private async getTags(release: GithubRelease): Promise<void> {
        const cacheData = this.get();
        if (cacheData && (await cacheData.info()).head.sha === release.target_commitish) {
            return;
        }

        this.debug.log('release: load start', { hash: release.target_commitish });
        const dbData = await this.cache.get('REPO_DATA_RAW');
        if (dbData?.head.sha === release.target_commitish) {
            this.debug.log('release: load end with db data', { hash: dbData.head.sha });
            await this.set(dbData);
            return;
        }
        const {
            commit: { sha },
        } = await lastValueFrom(
            this.http.get<{ commit: { sha: string } }>(this.endpoints.github(`repos/${DB_REPO}/branches/release`)),
        );
        const data = await lastValueFrom(
            this.http.get<RepoData<'raw'>>(`https://cdn.jsdelivr.net/gh/${DB_REPO}@${sha}/db.raw.json`),
        );
        this.debug.log('release: load end with remote data', { hash: data.head.sha });
        await this.set(data);
        await this.cache.set('REPO_DATA_RAW', data);
    }
}
