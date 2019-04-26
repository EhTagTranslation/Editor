import { Injectable, EventEmitter } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ApiEndpointService } from './api-endpoint.service';
import { GithubRelease, GithubReleaseAsset } from 'src/interfaces/github';
import { DebugService } from './debug.service';
import { TagType, RepoData, Sha1Value } from 'src/interfaces/ehtag';
import { of, BehaviorSubject, merge, timer, from } from 'rxjs';
import { map, tap, flatMap, catchError, filter, distinctUntilChanged, debounceTime, finalize } from 'rxjs/operators';
import Dexie from 'dexie';

function notUndef<T>(v: T | undefined): v is Exclude<T, undefined> {
  return v !== undefined;
}

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
    this.db.data.get('raw').then(v => v && this.set('raw', v));
    this.db.data.get('html').then(v => v && this.set('html', v));
    this.db.data.get('text').then(v => v && this.set('text', v));
    this.db.data.get('ast').then(v => v && this.set('ast', v));
    this.db.data.get('full').then(v => v && this.set('full', v));

    merge(
      this.refreshEvent,
      timer(0, 50_000)
    ).pipe(
      tap(v => this.debug.log('release: fetch start', v)),
      flatMap(_ => this.getRelease().pipe(catchError(error => of(error)))),
      tap(v => this.debug.log('release: fetch end', v)),
      filter((v): v is GithubRelease => v
        && typeof v.id === 'number'
        && typeof v.target_commitish === 'string'
        && Array.isArray(v.assets)),
      distinctUntilChanged((r1, r2) => r1.id === r2.id)
    ).subscribe(release => {
      this.getTags(release, 'raw');
      this.getTags(release, 'html');
      this.getTags(release, 'text');
      this.getTags(release, 'ast');
      this.getTags(release, 'full');
    });
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
    raw: this.tagsData.raw.pipe(filter(notUndef), map(v => v.data)),
    html: this.tagsData.html.pipe(filter(notUndef), map(v => v.data)),
    text: this.tagsData.text.pipe(filter(notUndef), map(v => v.data)),
    ast: this.tagsData.ast.pipe(filter(notUndef), map(v => v.data)),
    full: this.tagsData.full.pipe(filter(notUndef), map(v => v.data)),
  };

  private getReleasePromise?: Promise<GithubRelease>;
  private getRelease() {
    const get = () => {
      const endpoint = this.endpoints.github('repos/ehtagtranslation/Database/releases/latest');
      return this.http.get<GithubRelease>(endpoint).toPromise();
    };
    if (this.getReleasePromise) {
      return from(this.getReleasePromise);
    }
    return from(this.getReleasePromise = get()).pipe(finalize(() => this.getReleasePromise = undefined));
  }
  refresh() {
    this.refreshEvent.next(-1);
  }
  private set<T extends TagType>(type: T, value: TagRecord<T>) {
    (this.tagsData[type] as BehaviorSubject<TagRecord<T> | undefined>).next(value);
  }
  private get<T extends TagType>(type: T) {
    return (this.tagsData[type] as BehaviorSubject<TagRecord<T> | undefined>).value;
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

  private async getTags<T extends TagType>(release: GithubRelease, type: T) {
    this.debug.log('release: load start', type, release.target_commitish);
    const cachedata = this.get(type);
    if (cachedata && cachedata.hash === release.target_commitish) {
      this.debug.log('release: load end with cachedata', type, cachedata.hash);
      return;
    }

    const dbdata = await this.db.data.get(type);
    if (dbdata && dbdata.hash === release.target_commitish) {
      this.set(type, dbdata);
      this.debug.log('release: load end with dbdata', type, dbdata.hash);
      return;
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
    this.debug.log('release: load end with remotedata', type, data.hash);
    this.db.data.put(data);
  }
}
