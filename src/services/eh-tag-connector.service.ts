import { Injectable, EventEmitter } from '@angular/core';
import { HttpClient, HttpRequest } from '@angular/common/http';
import { fromEvent, Observable, Subject, from, Subscriber } from 'rxjs';
import { filter, map, merge, tap } from 'rxjs/operators';
import { ETItem, ETNamespace, ETRoot, ETTag, ETKey } from '../interfaces/interface';
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
  private tags: ETItem[];

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

  async getTags(): Promise<ETItem[]> {
    const endpoint = this.endpoints.github('repos/ehtagtranslation/Database/releases/latest');
    const release = await this.http.get<GithubRelease>(endpoint).toPromise();
    this.hash = release.target_commitish;
    if (this.tags) {
      return this.tags;
    }
    const assetUrl = release.assets.find(i => i.name === 'db.raw.js').browser_download_url;

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
    script.setAttribute('src', assetUrl);
    document.getElementsByTagName('head')[0].appendChild(script);

    try {
      const data = await promise;
      this.hash = data.head.sha;
      const tags: ETItem[] = [];
      data.data.forEach(namespace => {
        for (const raw in namespace.data) {
          if (namespace.data.hasOwnProperty(raw)) {
            const element = namespace.data[raw];
            tags.push({
              ...element,
              raw,
              namespace: namespace.namespace,
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
