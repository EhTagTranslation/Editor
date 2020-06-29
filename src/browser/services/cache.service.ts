import Dexie from 'dexie';
import { RepoData } from 'shared/interfaces/ehtag';
import { Injectable } from '@angular/core';

class CacheStore extends Dexie {
    // Declare implicit table properties.
    // (just to inform Typescript. Instanciated by Dexie in stores() method)
    data!: Dexie.Table<{ key: string; value: unknown }, string>;
    constructor() {
        super('cache-store');
        this.version(1).stores({
            data: 'key',
        });
    }
}

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
    private db = new CacheStore();

    async get<T extends keyof CacheMap>(key: T): Promise<CacheMap[T] | undefined>;
    async get(key: string): Promise<unknown | undefined>;
    async get(key: string): Promise<unknown | undefined> {
        const kv = await this.db.data.get(key);
        return kv?.value;
    }

    async set<T extends keyof CacheMap>(key: T, value: CacheMap[T]): Promise<void>;
    async set(key: string, value: unknown): Promise<void>;
    async set(key: string, value: unknown): Promise<void> {
        await this.db.data.put({ key, value });
    }

    async delete<T extends keyof CacheMap>(key: T): Promise<void>;
    async delete(key: string): Promise<void>;
    async delete(key: string): Promise<void> {
        await this.db.data.delete(key);
    }
}
