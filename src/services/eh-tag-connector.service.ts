import { Injectable, EventEmitter } from '@angular/core';
import { HttpClient, HttpRequest } from '@angular/common/http';
import { fromEvent, Observable, Subject, from, Subscriber } from 'rxjs';
import { filter, map, merge, tap } from 'rxjs/operators';
import { ETItem, ETNamespace, ETRoot, ETTag, ETKey, RenderedETItem } from '../interfaces/ehtranslation';
import { ApiEndpointService } from './api-endpoint.service';
import { GithubRelease, GithubReleaseAsset } from 'src/interfaces/github';

const EH_TAG_HASH = 'eh-tag-hash';
const EH_TAG_DATA = 'eh-tag-data';
const EH_TAG_DATA_HASH = 'eh-tag-data-hash';

@Injectable({
  providedIn: 'root'
})
export class EhTagConnectorService {
  hashChange: EventEmitter<string | null> = new EventEmitter();
  private hashStr: string | null;
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
    console.log(`hash: ${oldValue} -> ${newValue}`);
    this.hashChange.emit(newValue);
    this.tags = null;
    localStorage.setItem(EH_TAG_HASH, newValue || '');
  }

  private getEndpoint(item: NonNullable<ETKey>) {
    return this.endpoints.ehTagConnector(`${item.namespace}/${item.raw.trim().toLowerCase()}?format=raw.json`);
  }

  async getTag(item: NonNullable<ETKey>): Promise<ETItem> {
    const endpoint = this.getEndpoint(item);
    return await this.http.get<ETItem>(endpoint).toPromise();
  }

  async addTag(item: NonNullable<ETItem>): Promise<ETItem> {
    const endpoint = this.getEndpoint(item);
    const payload: ETTag = {
      intro: item.intro,
      name: item.name,
      links: item.links,
    };
    return await this.http.post<ETItem>(endpoint, payload).toPromise();
  }

  async modifyTag(item: NonNullable<ETItem>): Promise<ETItem> {
    const endpoint = this.getEndpoint(item);
    const payload: ETTag = {
      intro: item.intro,
      name: item.name,
      links: item.links,
    };
    return await this.http.put<ETItem>(endpoint, payload).toPromise();
  }

  async deleteTag(item: NonNullable<ETKey>): Promise<void> {
    const endpoint = this.getEndpoint(item);
    return await this.http.delete<void>(endpoint).toPromise();
  }

  async getHash() {
    return await this.http.head<void>(this.endpoints.ehTagConnector()).toPromise();
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
    if (this.tags && release.target_commitish === localStorage.getItem(EH_TAG_DATA_HASH)) {
      return this.tags;
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

  // https://ehtagconnector.azurewebsites.net/api/database
  constructor(
    private http: HttpClient,
    private endpoints: ApiEndpointService,
  ) {
    this.hashStr = localStorage.getItem(EH_TAG_HASH) || null;
    const data = localStorage.getItem(EH_TAG_DATA);
    if (data) {
      try {
        const tags = JSON.parse(data);
        if (Array.isArray(tags)) {
          this.tags = tags;
        }
      } catch (ex) {
        console.log(ex);
      }
    }
  }
}
