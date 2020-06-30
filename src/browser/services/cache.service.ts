import { RepoData } from 'shared/interfaces/ehtag';
import { Injectable } from '@angular/core';
import * as idb from 'idb-keyval';

interface CacheMap {
    REPO_DATA_RAW: RepoData<'raw'>;
    REPO_DATA_AST: RepoData<'ast'>;
    REPO_DATA_FULL: RepoData<'full'>;
    REPO_DATA_HTML: RepoData<'html'>;
    REPO_DATA_TEXT: RepoData<'text'>;
}

@Injectable({
    providedIn: 'root',
})
export class CacheService {
    async get<T extends keyof CacheMap>(key: T): Promise<CacheMap[T] | undefined>;
    async get(key: string): Promise<unknown | undefined>;
    async get(key: string): Promise<unknown | undefined> {
        return idb.get(key);
    }

    async set<T extends keyof CacheMap>(key: T, value: CacheMap[T]): Promise<void>;
    async set(key: string, value: unknown): Promise<void>;
    async set(key: string, value: unknown): Promise<void> {
        return idb.set(key, value);
    }

    async delete<T extends keyof CacheMap>(key: T): Promise<void>;
    async delete(key: string): Promise<void>;
    async delete(key: string): Promise<void> {
        return idb.del(key);
    }

    async keys(): Promise<string[]> {
        return idb.keys() as Promise<string[]>;
    }

    async clear(): Promise<void> {
        return idb.clear();
    }
}
