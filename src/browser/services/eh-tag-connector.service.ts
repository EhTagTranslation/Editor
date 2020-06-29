import { Injectable, isDevMode } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, throwError, OperatorFunction } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ETKey } from '../interfaces/ehtranslation';
import { ApiEndpointService } from './api-endpoint.service';
import { TagType, Tag, NamespaceName } from 'shared/interfaces/ehtag';
import { GithubReleaseService } from './github-release.service';
import { LocalStorageService } from './local-storage.service';
import { TagRecord } from 'shared/tag-record';
import { Context } from 'shared/interfaces/database';

const EH_TAG_HASH = 'eh-tag-hash';

function mapStatusCodeTo<R, T>(status: number, v: T): OperatorFunction<R, R | T> {
    return catchError<R, Observable<T>>((ex: HttpErrorResponse) => (ex.status === status ? of(v) : throwError(ex)));
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
        private readonly localStorage: LocalStorageService,
    ) {
        if (isDevMode()) {
            Object.defineProperty(globalThis, 'setHash', {
                value: (hash: string) => (this.hash = hash),
            });
        }
    }

    private readonly hashStorage = this.localStorage.get(EH_TAG_HASH);
    readonly hashChange = this.hashStorage.valueChange;
    get hash(): string | null {
        return this.hashStorage.value;
    }
    set hash(value: string | null) {
        this.hashStorage.value = value;
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
        format: T = ('raw' as TagType) as T,
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

    normalizeTag<T extends TagType = 'raw'>(
        item: Tag<'raw'>,
        namespace: NamespaceName,
        format: T = 'raw' as T,
    ): Observable<Tag<T>> {
        return this.release.tags.pipe(
            map((t) => {
                const payload: Tag<'raw'> = {
                    intro: item.intro,
                    name: item.name,
                    links: item.links,
                };
                const nsDb = t.data[namespace];
                const rendered = TagRecord.unsafeCreate(payload, nsDb).render(format, Context.create(nsDb));
                return rendered;
            }),
        );
    }
}
