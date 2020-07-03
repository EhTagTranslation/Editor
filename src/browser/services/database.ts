import { TagType, RepoData } from 'shared/interfaces/ehtag';
import { CacheService } from './cache.service';
import { DatabaseInMemory as DatabaseInMemoryBase } from './database.shared';

export class DatabaseInMemory extends DatabaseInMemoryBase {
    constructor(private readonly cacheService: CacheService, storage?: RepoData<'raw'>, revision?: number) {
        super(storage, revision);
        this.revision = revision ?? -1;
    }

    private readonly cache = {} as { [T in TagType]: RepoData<T> | undefined };
    async render<T extends TagType>(type: T): Promise<RepoData<T>> {
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

        const result = await (DatabaseInMemory.worker
            ? new Promise<RepoData<T>>((resolve, reject) => {
                  if (DatabaseInMemory.worker) {
                      DatabaseInMemory.worker.postMessage({
                          storage: this.storage,
                          type,
                      });
                      DatabaseInMemory.worker.onmessage = ({ data }) => {
                          resolve(data as RepoData<T>);
                      };
                  } else reject(new Error('no webworker'));
              })
            : super.render(type));
        this.cache[type] = result as never;
        void this.cacheService.set(cacheKey, result);
        return result;
    }

    private static readonly worker =
        typeof Worker !== 'undefined' ? new Worker('./database.worker', { type: 'module' }) : undefined;
}
