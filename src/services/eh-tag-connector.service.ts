import { Injectable, EventEmitter } from '@angular/core';
import { HttpClient, HttpRequest } from '@angular/common/http';
import { fromEvent, Observable, Subject, from, Subscriber } from 'rxjs';
import { filter, map, merge, tap } from 'rxjs/operators';
import { ETItem, ETNamespace, ETRoot, ETTag, ETKey, RenderedETItem } from '../interfaces/interface';
import { ApiEndpointService } from './api-endpoint.service';
import { GithubRelease } from 'src/interfaces/github';

const EH_TAG_HASH = 'eh-tag-hash';
const EH_TAG_DATA = 'eh-tag-data';

@Injectable({
  providedIn: 'root'
})
export class EhTagConnectorService {
  hashChange: EventEmitter<string> = new EventEmitter();
  private hashStr: string;
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
  private tags: ReadonlyArray<RenderedETItem>;

  private onHashChange(oldValue: string, newValue: string) {
    console.log(`hash: ${oldValue} -> ${newValue}`);
    this.hashChange.emit(newValue);
    this.tags = null;
    localStorage.setItem(EH_TAG_HASH, newValue);
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

  private async jsonpLoad(url: string) {
    if (globalThis.load_ehtagtranslation_database) {
      throw new Error('Fetching other data.');
    }
    const promise = new Promise<ETRoot>((resolve, reject) => {
      let timeoutGuard: ReturnType<typeof setTimeout>;

      const close = () => {
        clearTimeout(timeoutGuard);
        globalThis.load_ehtagtranslation_database = null;
      };

      timeoutGuard = setTimeout(() => {
        reject(new Error('Get EhTag Timeout'));
        close();
      }, 30 * 1000);

      globalThis.load_ehtagtranslation_database = (data: ETRoot) => {
        resolve(data);
        close();
      };
    });

    const script = document.createElement('script');
    script.setAttribute('src', url);
    document.getElementsByTagName('head')[0].appendChild(script);

    return promise;
  }

  async getTags(): Promise<ReadonlyArray<RenderedETItem>> {
    const endpoint = this.endpoints.github('repos/ehtagtranslation/Database/releases/latest');
    const release = await this.http.get<GithubRelease>(endpoint).toPromise();
    this.hash = release.target_commitish;
    if (this.tags) {
      return this.tags;
    }
    try {
      const assetUrlRaw = release.assets.find(i => i.name === 'db.raw.js').browser_download_url;
      const assetUrlHtml = release.assets.find(i => i.name === 'db.html.js').browser_download_url;
      const assetUrlText = release.assets.find(i => i.name === 'db.text.js').browser_download_url;
      const dataRaw = await this.jsonpLoad(assetUrlRaw);
      const dataHtml = await this.jsonpLoad(assetUrlHtml);
      const dataText = await this.jsonpLoad(assetUrlText);
      this.hash = dataRaw.head.sha;
      const tags: RenderedETItem[] = [];
      dataRaw.data.forEach(namespaceRaw => {
        const namespaceHtml = dataHtml.data.find(ns => ns.namespace === namespaceRaw.namespace);
        const namespaceText = dataText.data.find(ns => ns.namespace === namespaceRaw.namespace);
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
      return tags;
    } catch (e) {
      console.error(e);
    }
  }

  // https://ehtagconnector.azurewebsites.net/api/database
  constructor(
    private http: HttpClient,
    private endpoints: ApiEndpointService,
  ) {
    this.hash = localStorage.getItem(EH_TAG_HASH);
    const data = localStorage.getItem(EH_TAG_DATA);
    if (data) {
      this.tags = JSON.parse(data);
    }
  }
}
