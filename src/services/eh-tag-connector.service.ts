import { Injectable, EventEmitter } from '@angular/core';
import { HttpClient, HttpRequest } from '@angular/common/http';
import { fromEvent, Observable, Subject, from, Subscriber, of, BehaviorSubject } from 'rxjs';
import { filter, map, merge, tap, catchError } from 'rxjs/operators';
import { ETItem, ETNamespace, ETRoot, ETTag, ETKey, RenderedETItem, RenderedETTag } from '../interfaces/ehtranslation';
import { ApiEndpointService } from './api-endpoint.service';
import { GithubRelease, GithubReleaseAsset } from 'src/interfaces/github';
import { DebugService } from './debug.service';

const EH_TAG_HASH = 'eh-tag-hash';
const EH_TAG_DATA = 'eh-tag-data';
const EH_TAG_DATA_HASH = 'eh-tag-data-hash';
type ApiFormat = 'raw' | 'html' | 'ast' | 'text';


const normalizeCache = {
  raw: new Map<string, string>(),
  html: new Map<string, string>(),
  text: new Map<string, string>(),
  ast: new Map<string, any>(),
};

function localRender(source: string) {
  source = source.trim();
  if (source.search(/[<*[_~\\\r\n]/) < 0) {
    return source;
  }
  return undefined;
}

@Injectable({
  providedIn: 'root'
})
export class EhTagConnectorService {

  // https://ehtagconnector.azurewebsites.net/api/database
  constructor(
    private http: HttpClient,
    private endpoints: ApiEndpointService,
    private debug: DebugService,
  ) {
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
  loading: boolean;
  private tags: ReadonlyArray<RenderedETItem> | null;

  private onHashChange(oldValue: string | null, newValue: string | null) {
    this.debug.log(`hash: ${oldValue} -> ${newValue}`);
    this.hashChange.next(newValue);
    this.tags = null;
    localStorage.setItem(EH_TAG_HASH, newValue || '');
  }

  private getEndpoint(item: ETKey, format: ApiFormat = 'raw') {
    return this.endpoints.ehTagConnectorDb(`${item.namespace}/${item.raw.trim().toLowerCase()}?format=${format}.json`);
  }

  async getTag(item: ETKey): Promise<ETTag | null> {
    const endpoint = this.getEndpoint(item);
    return await this.http.get<ETTag>(endpoint).pipe(catchError(ex => {
      if (ex.status && ex.status === 404) {
        return of(null);
      } else {
        throw ex;
      }
    })).toPromise();
  }

  async addTag(item: ETItem): Promise<ETTag> {
    const endpoint = this.getEndpoint(item);
    const payload: ETTag = {
      intro: item.intro,
      name: item.name,
      links: item.links,
    };
    return await this.http.post<ETTag>(endpoint, payload).toPromise();
  }

  async normalizeTag(item: ETTag, format: ApiFormat = 'raw'): Promise<ETTag> {
    const payload: ETTag = {
      intro: item.intro,
      name: item.name,
      links: item.links,
    };
    const cache = normalizeCache[format];
    const cachedname = cache.get(item.name);
    const cachedintro = cache.get(item.intro);
    const cachedlinks = cache.get(item.links);
    if (typeof cachedintro !== 'undefined' && typeof cachedname !== 'undefined' && typeof cachedlinks !== 'undefined') {
      return {
        intro: cachedintro,
        name: cachedname,
        links: cachedlinks,
      };
    }
    if (format !== 'ast') {
      const localname = cachedname || localRender(item.name);
      const localintro = cachedintro || localRender(item.intro);
      const locallinks = cachedlinks || localRender(item.links);
      if (typeof localname !== 'undefined' && typeof localintro !== 'undefined' && typeof locallinks !== 'undefined') {
        return {
          name: localname,
          intro: localintro,
          links: locallinks,
        };
      }
    }
    const endpoint = this.endpoints.ehTagConnectorTools('normalize') + `?format=${format}.json`;
    const result = await this.http.post<ETTag>(endpoint, payload).toPromise();
    cache.set(item.name, result.name);
    cache.set(item.intro, result.intro);
    cache.set(item.links, result.links);
    return result;
  }

  async modifyTag(item: ETItem): Promise<ETTag | null> {
    const endpoint = this.getEndpoint(item);
    const payload: ETTag = {
      intro: item.intro,
      name: item.name,
      links: item.links,
    };
    return await this.http.put<ETTag>(endpoint, payload).toPromise();
  }

  async deleteTag(item: ETKey): Promise<void> {
    const endpoint = this.getEndpoint(item);
    return await this.http.delete<void>(endpoint).toPromise();
  }

  async getHash() {
    return await this.http.head<void>(this.endpoints.ehTagConnectorDb()).toPromise();
  }

  private async jsonpLoad(asset: GithubReleaseAsset) {
    const callbackName = 'load_ehtagtranslation_' + asset.name.split('.').splice(0, 2).join('_');
    if (globalThis[callbackName]) {
      throw new Error(`Callback ${callbackName} has registered.`);
    }

    const promise = new Promise<ETRoot>((resolve, reject) => {
      let timeoutGuard: ReturnType<typeof setTimeout>;

      const close = () => {
        clearTimeout(timeoutGuard);
        globalThis[callbackName] = undefined;
      };

      timeoutGuard = setTimeout(() => {
        reject(new Error(`Get ${asset.name} timeout`));
        close();
      }, 30 * 1000);

      globalThis[callbackName] = (data: ETRoot) => {
        resolve(data);
        close();
      };
    });

    const script = document.createElement('script');
    script.setAttribute('src', asset.browser_download_url);
    const head = document.querySelector('head');
    if (!head) {
      throw new Error('head element not found!');
    }
    head.appendChild(script);

    return promise;
  }

  async getTags(): Promise<ReadonlyArray<RenderedETItem>> {
    const endpoint = this.endpoints.github('repos/ehtagtranslation/Database/releases/latest');
    const release = await this.http.get<GithubRelease>(endpoint).toPromise();
    this.hash = release.target_commitish;
    if (release.target_commitish === localStorage.getItem(EH_TAG_DATA_HASH)) {
      if (this.tags) {
        return this.tags;
      }
      const data = localStorage.getItem(EH_TAG_DATA);
      if (data) {
        try {
          const localTags = JSON.parse(data);
          if (Array.isArray(localTags)) {
            this.tags = localTags;
            return this.tags;
          }
        } catch (ex) {
          this.debug.error(ex);
        }
      }
    }

    const assetRaw = release.assets.find(i => i.name === 'db.raw.js');
    const assetHtml = release.assets.find(i => i.name === 'db.html.js');
    const assetText = release.assets.find(i => i.name === 'db.text.js');
    if (!assetRaw || !assetHtml || !assetText) {
      throw new Error('Github release asset not found!');
    }

    const reqRaw = this.jsonpLoad(assetRaw);
    const reqHtml = this.jsonpLoad(assetHtml);
    const reqText = this.jsonpLoad(assetText);

    const dataRaw = await reqRaw;
    const dataHtml = await reqHtml;
    const dataText = await reqText;

    this.hash = dataRaw.head.sha;
    const tags: RenderedETItem[] = [];
    dataRaw.data.forEach(namespaceRaw => {
      const namespaceHtml = dataHtml.data.find(ns => ns.namespace === namespaceRaw.namespace) as ETNamespace;
      const namespaceText = dataText.data.find(ns => ns.namespace === namespaceRaw.namespace) as ETNamespace;
      for (const raw in namespaceRaw.data) {
        if (namespaceRaw.data.hasOwnProperty(raw)) {
          const elementRaw = namespaceRaw.data[raw];
          const elementHtml = namespaceHtml.data[raw];
          const elementText = namespaceText.data[raw];
          tags.push({
            ...elementRaw,
            renderedIntro: elementHtml.intro,
            renderedLinks: elementHtml.links,
            renderedName: elementHtml.name,
            textIntro: elementText.intro,
            textLinks: elementText.links,
            textName: elementText.name,
            raw,
            namespace: namespaceRaw.namespace,
          });
        }
      }
    });
    this.tags = tags;
    localStorage.setItem(EH_TAG_DATA, JSON.stringify(tags));
    localStorage.setItem(EH_TAG_DATA_HASH, release.target_commitish);
    return tags;
  }
}
