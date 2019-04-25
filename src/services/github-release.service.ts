import { Injectable, EventEmitter } from '@angular/core';
import { HttpClient, HttpRequest } from '@angular/common/http';
import { ApiEndpointService } from './api-endpoint.service';
import { GithubRelease, GithubReleaseAsset } from 'src/interfaces/github';
import { DebugService } from './debug.service';
import { TagType, RepoData, Sha1Value } from 'src/interfaces/ehtag';
import { from, Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import Dexie from 'dexie';

const EH_TAG_HASH = 'github-eh-tag-hash-';
const EH_TAG_DATA = 'github-eh-tag-data-';

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

  private tags: { [k in TagType]?: RepoData<k> } = {};
  private getTagsPromise: { [k in TagType]?: Promise<RepoData<k>> } = {};
  private get<T extends TagType>(type: T): RepoData<T> | undefined {
    return this.tags[type] as RepoData<T> | undefined;
  }
  private set<T extends TagType>(type: T, value: RepoData<T> | undefined) {
    this.tags[type] = value as any;
  }

  getCachedTags<T extends TagType>(type: T): RepoData<T> | undefined {
    const cache = this.get(type);
    if (cache) {
      return cache;
    }
    const DATA_KEY = EH_TAG_DATA + type;
    // this.db.data.get(type).then(console.log);
    const sdata = localStorage.getItem(DATA_KEY);
    if (!sdata) {
      return undefined;
    }
    try {
      const localTags = JSON.parse(sdata) as RepoData<T>;
      if (!Array.isArray(localTags.data) || typeof localTags.repo !== 'string') {
        throw new Error(`Invalid storage of ${type}.`);
      }
      this.set(type, localTags);
      return localTags;
    } catch (ex) {
      // this.db.data.delete( type);
      localStorage.removeItem(DATA_KEY);
      this.debug.error(ex);
      return undefined;
    }
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
      }, 30 * 1000);

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
    const HASH_KEY = EH_TAG_HASH + type;
    const DATA_KEY = EH_TAG_DATA + type;
    // this.db.data.get(type).then(console.log);
    if (release.target_commitish === localStorage.getItem(HASH_KEY)) {
      const cache = this.getCachedTags(type);
      if (cache) {
        return cache;
      }
    }

    const asset = release.assets.find(i => i.name === `db.${type}.js`);
    if (!asset) {
      throw new Error('Github release asset not found!');
    }

    const req = this.jsonpLoad<T>(asset);
    const data = await req;
    this.set(type, data);
    // this.db.data.put({
    //   type,
    //   data,
    //   hash: release.target_commitish,
    // });
    localStorage.setItem(DATA_KEY, JSON.stringify(data));
    localStorage.setItem(HASH_KEY, release.target_commitish);
    return data;
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
