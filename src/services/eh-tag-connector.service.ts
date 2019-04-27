import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, BehaviorSubject, throwError, combineLatest } from 'rxjs';
import { map, tap, catchError, filter } from 'rxjs/operators';
import { ETKey } from '../interfaces/ehtranslation';
import { ApiEndpointService } from './api-endpoint.service';
import { DebugService } from './debug.service';
import { TagType, CellType, Tag, RepoData } from 'src/interfaces/ehtag';
import { GithubReleaseService } from './github-release.service';

const EH_TAG_HASH = 'eh-tag-hash';

function mapStatusCodeTo<R, T>(status: number, v: T) {
  return catchError<R, Observable<T>>(ex => ex.status === status ? of(v) : throwError(ex));
}

@Injectable({
  providedIn: 'root'
})
export class EhTagConnectorService {

  // https://ehtagconnector.azurewebsites.net/api/database
  constructor(
    private http: HttpClient,
    private endpoints: ApiEndpointService,
    private relese: GithubReleaseService,
    private debug: DebugService,
  ) {
    combineLatest([
      relese.tags.raw,
      relese.tags.raw,
    ]).pipe(filter(v => v[0].head.sha === v[1].head.sha)).subscribe(v => this.fillCache(v[0], v[1], 'raw'));
    combineLatest([
      relese.tags.raw,
      relese.tags.html,
    ]).pipe(filter(v => v[0].head.sha === v[1].head.sha)).subscribe(v => this.fillCache(v[0], v[1], 'html'));
    combineLatest([
      relese.tags.raw,
      relese.tags.text,
    ]).pipe(filter(v => v[0].head.sha === v[1].head.sha)).subscribe(v => this.fillCache(v[0], v[1], 'text'));
    combineLatest([
      relese.tags.raw,
      relese.tags.ast,
    ]).pipe(filter(v => v[0].head.sha === v[1].head.sha)).subscribe(v => this.fillCache(v[0], v[1], 'ast'));
    combineLatest([
      relese.tags.raw,
      relese.tags.full,
    ]).pipe(filter(v => v[0].head.sha === v[1].head.sha)).subscribe(v => this.fillCache(v[0], v[1], 'full'));
  }
  private hashStr = localStorage.getItem(EH_TAG_HASH) || null;
  hashChange = new BehaviorSubject<string | null>(this.hashStr);
  get hash() {
    return this.hashStr;
  }
  set hash(value) {
    const oldVal = this.hashStr;
    if (oldVal === value) {
      return;
    }
    this.hashStr = value;
    this.onHashChange(oldVal, value);
  }

  private readonly normalizeCache = {
    raw: new Map<string, CellType<'raw'>>(),
    html: new Map<string, CellType<'html'>>(),
    text: new Map<string, CellType<'text'>>(),
    ast: new Map<string, CellType<'ast'>>(),
    full: new Map<string, CellType<'full'>>(),
  };

  private fillCache<T extends TagType>(dataRaw: RepoData<'raw'>, data: RepoData<T>, format: T) {
    const cacheMap = this.normalizeCache[format] as Map<string, CellType<T>>;
    for (const ns of data.data) {
      const nsRaw = dataRaw.data.find(n => n.namespace === ns.namespace);
      if (!nsRaw) {
        continue;
      }
      for (const key in ns.data) {
        if (ns.data.hasOwnProperty(key)) {
          const element = ns.data[key];
          const elementRaw = nsRaw.data[key];
          cacheMap.set(elementRaw.name, element.name);
          cacheMap.set(elementRaw.intro, element.intro);
          cacheMap.set(elementRaw.links, element.links);
        }
      }
    }
  }

  private localRender<T extends TagType>(source: string, format: T): CellType<T> | undefined {
    if (format === 'ast' || format === 'full') {
      return undefined;
    }
    const haveOne = (data: string, ch: string) => {
      return data.indexOf(ch) >= 0;
    };
    const haveTwo = (data: string, ch: string) => {
      return data.indexOf(ch) !== data.lastIndexOf(ch);
    };
    const havePair = (data: string, l: string, r: string) => {
      return data.indexOf(l) < data.indexOf(r);
    };
    const handlePara = (lines: ReadonlyArray<string>) => {
      const joined = lines.join('\n');
      if (haveOne(joined, '\\') || haveTwo(joined, '~') || haveTwo(joined, '_') || haveTwo(joined, '*')) {
        return undefined;
      }
      if (havePair(joined, '<', '>') || havePair(joined, '[', ']')) {
        return undefined;
      }
      if (format === 'raw' || format === 'text') {
        return joined;
      }
      return '<p>' + lines.join('<br>\n') + '</p>';
    };
    const paras: string[][] = [];
    const spaces: number[] = [0];
    let pending: string[] | null = null;
    for (const line of source.split('\n').map(l => l.trim())) {
      if (line.length === 0) {
        if (pending === null) {
          spaces[spaces.length - 1]++;
        } else {
          paras.push(pending);
          pending = null;
          spaces[spaces.length] = 0;
        }
      } else {
        if (pending === null) {
          pending = [line];
        } else {
          pending.push(line);
        }
      }
    }
    if (pending !== null) {
      paras.push(pending);
      pending = null;
      spaces[spaces.length] = 0;
    }
    const handledParas = paras.map(handlePara);
    if (handledParas.indexOf(undefined) >= 0) {
      return undefined;
    }
    if (format === 'raw') {
      return spaces.reduce((str, sp, idx) => str + '\n'.repeat(sp) + (handledParas[idx] || ''), '') as CellType<T>;
    }
    return handledParas.join('\n') as CellType<T>;
  }

  private onHashChange(oldValue: string | null, newValue: string | null) {
    this.debug.log(`hash: ${oldValue} -> ${newValue}`);
    this.hashChange.next(newValue);
    localStorage.setItem(EH_TAG_HASH, newValue || '');
  }

  private getEndpoint(item: ETKey, format: TagType) {
    if (format === 'full') {
      return this.endpoints.ehTagConnectorDb(`${item.namespace}/${item.raw.trim().toLowerCase()}?format=json`);
    }
    return this.endpoints.ehTagConnectorDb(`${item.namespace}/${item.raw.trim().toLowerCase()}?format=${format}.json`);
  }

  updateHash(): Observable<void> {
    const endpoint = this.endpoints.ehTagConnectorDb();
    return this.http.head<void>(endpoint);
  }

  getTag<T extends TagType = 'raw'>(key: ETKey, format: T = 'raw' as T): Observable<Tag<T> | null> {
    const endpoint = this.getEndpoint(key, format);
    return this.http.get<Tag<T>>(endpoint).pipe(mapStatusCodeTo(404, null));
  }
  addTag<T extends TagType = 'raw'>(key: ETKey, value: Tag<'raw'>, format: T = 'raw' as T): Observable<Tag<T> | null> {
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
    return this.http.head(endpoint).pipe(map(_ => true), mapStatusCodeTo(404, false));
  }
  modifyTag<T extends TagType = 'raw'>(key: ETKey, value: Tag<'raw'>, format: T = 'raw' as T): Observable<Tag<T> | null> {
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
      map(_ => true),
      mapStatusCodeTo(404, false));
  }

  normalizeTag<T extends TagType = 'raw'>(item: Tag<'raw'>, format: T = 'raw' as T): Observable<Tag<T>> {
    const payload: Tag<'raw'> = {
      intro: item.intro,
      name: item.name,
      links: item.links,
    };
    const cache = this.normalizeCache[format] as Map<string, CellType<T>>;
    const cachedname = cache.get(item.name);
    const cachedintro = cache.get(item.intro);
    const cachedlinks = cache.get(item.links);
    if (typeof cachedintro !== 'undefined' && typeof cachedname !== 'undefined' && typeof cachedlinks !== 'undefined') {
      return of({
        intro: cachedintro,
        name: cachedname,
        links: cachedlinks,
      });
    }
    const localname = cachedname || this.localRender(item.name, format);
    const localintro = cachedintro || this.localRender(item.intro, format);
    const locallinks = cachedlinks || this.localRender(item.links, format);
    if (typeof localname !== 'undefined' && typeof localintro !== 'undefined' && typeof locallinks !== 'undefined') {
      return of({
        name: localname,
        intro: localintro,
        links: locallinks,
      });
    }
    const endpoint = this.endpoints.ehTagConnectorTools('normalize') + (format === 'full' ? '?format=json' : `?format=${format}.json`);
    return this.http.post<Tag<T>>(endpoint, payload).pipe(tap(result => {
      cache.set(item.name, result.name);
      cache.set(item.intro, result.intro);
      cache.set(item.links, result.links);
    }));
  }
}
