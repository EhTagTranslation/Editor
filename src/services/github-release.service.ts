import { Injectable, EventEmitter } from '@angular/core';
import { HttpClient, HttpRequest } from '@angular/common/http';
import { ApiEndpointService } from './api-endpoint.service';
import { GithubRelease, GithubReleaseAsset } from 'src/interfaces/github';
import { DebugService } from './debug.service';
import { TagType, RepoData, Sha1Value } from 'src/interfaces/ehtag';
import { from, Observable, of } from 'rxjs';
import { finalize, map, tap } from 'rxjs/operators';
import Dexie from 'dexie';

interface TagRecord<T extends TagType> {
  type: T;
  hash: Sha1Value;
  data: RepoData<T>;
}
class TagStore extends Dexie {

  // Declare implicit table properties.
  // (just to inform Typescript. Instanciated by Dexie in stores() method)
  data: Dexie.Table<TagRecord<TagType>, TagType>;

  constructor() {
    super('tag-store');
    this.version(1).stores({
      data: 'type, hash',
    });
  }
}

@Injectable({
  providedIn: 'root'
})
export class GithubReleaseService {
  constructor(
    private http: HttpClient,
    private endpoints: ApiEndpointService,
    private debug: DebugService,
  ) {
  }
  private db = new TagStore();

  private tags: { [k in TagType]?: TagRecord<k> } = {};
  private getTagsPromise: { [k in TagType]?: Promise<RepoData<k>> } = {};
  private get<T extends TagType>(type: T): TagRecord<T> | undefined {
    return this.tags[type] as TagRecord<T> | undefined;
  }
  private set<T extends TagType>(type: T, value: TagRecord<T> | undefined) {
    this.tags[type] = value as any;
  }

  getCachedTags<T extends TagType>(type: T): Observable<RepoData<T> | undefined> {
    const cache = this.get(type);
    if (cache) {
      return of(cache.data);
    }
    return from(this.db.data.get(type)).pipe(tap(d => d && this.set(type, d)), map(d => d && d.data));
  }

  private async jsonpLoad<T extends TagType>(asset: GithubReleaseAsset) {
    const callbackName = 'load_ehtagtranslation_' + asset.name.split('.').splice(0, 2).join('_');
    if (globalThis[callbackName]) {
      throw new Error(`Callback ${callbackName} has registered.`);
    }

    const promise = new Promise<RepoData<T>>((resolve, reject) => {
      let timeoutGuard: ReturnType<typeof setTimeout>;

      const close = () => {
        clearTimeout(timeoutGuard);
        globalThis[callbackName] = undefined;
      };

      timeoutGuard = setTimeout(() => {
        reject(new Error(`Get ${asset.name} timeout`));
        close();
      }, 60 * 1000);

      globalThis[callbackName] = (data: RepoData<T>) => {
        resolve(data);
        close();
      };
    });

    const script = document.createElement('script');
    script.setAttribute('src', asset.browser_download_url);
    document.head.appendChild(script);

    return promise;
  }
  private async getTagsImpl<T extends TagType>(type: T): Promise<RepoData<T>> {
    const endpoint = this.endpoints.github('repos/ehtagtranslation/Database/releases/latest');
    const release = await this.http.get<GithubRelease>(endpoint).toPromise();

    const cachedata = this.get(type);
    if (cachedata && cachedata.hash === release.target_commitish) {
      return cachedata.data;
    }

    const dbdata = await this.db.data.get(type);
    if (dbdata && dbdata.hash === release.target_commitish) {
      this.set(type, dbdata);
      return dbdata.data;
    }

    const asset = release.assets.find(i => i.name === `db.${type}.js`);
    if (!asset) {
      throw new Error('Github release asset not found!');
    }

    const req = this.jsonpLoad<T>(asset);
    const data = {
      type,
      data: await req,
      hash: release.target_commitish,
    };
    this.set(type, data);
    this.db.data.put(data);
    return data.data;
  }

  getTags<T extends TagType>(type: T): Observable<RepoData<T>> {
    const cache = this.getTagsPromise[type];
    if (cache) {
      return from(cache as Promise<RepoData<T>>);
    }
    const promise = this.getTagsImpl(type);
    this.getTagsPromise[type] = promise as any;
    return from(promise).pipe(finalize(() => this.getTagsPromise[type] = undefined));
  }
}
