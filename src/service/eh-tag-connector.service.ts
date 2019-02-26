import { Injectable } from '@angular/core';
import { HttpClient, HttpRequest, JsonpClientBackend, JsonpInterceptor } from '@angular/common/http';
import { fromEvent, Observable, Subject, from } from 'rxjs';
import { Breakpoints } from '@angular/cdk/layout';
import { filter, map, merge } from 'rxjs/operators';
import { switchTap } from '@angular/router/src/operators/switch_tap';
import { ETItem, ETNamespace, ETRoot } from '../interfaces/interface';
import { forEach } from '@angular/router/src/utils/collection';


@Injectable({
  providedIn: 'root'
})
export class EhTagConnectorService {

  hashChange: Observable<any>;

  hash: string;

  namespace;
  loading: boolean;

  tags: ETItem[] = [];

  async getTags(): Promise<ETItem[]> {

    const info: any = await this.http.get('https://api.github.com/repos/ehtagtranslation/Database/releases/latest').toPromise();

    console.log('info', info);

    const asset: any = info.assets.find(i => i.name === 'db.raw.js');


    const promise = new Promise<ETRoot>((resolve, reject) => {

      const close = () => {
        clearTimeout(timeoutGuard);
        (window as any).load_ehtagtranslation_database = null;
      };

      const timeoutGuard = setTimeout(() => {
        reject(new Error('Get EhTag Timeout'));
        close();
      }, 30 * 1000);

      (window as any).load_ehtagtranslation_database = (data: any) => {
        resolve(data);
        close();
      };
    });

    const script = document.createElement('script');
    script.setAttribute('src', asset.browser_download_url + '?timetime=' + new Date().getTime());
    document.getElementsByTagName('head')[0].appendChild(script);

    try {
      const data = await promise;
      this.hash = data.head.sha;
      this.tags = [];
      data.data.forEach(namespace => {
        for (const raw in namespace.data) {
          if (namespace.data.hasOwnProperty(raw)) {
            const element = namespace.data[raw];
            this.tags.push({
              ...element,
              raw,
              namespace: namespace.namespace,
            });
          }
        }
      });
      return this.tags;
    } catch (e) {
      console.error(e);
    }
  }

  // https://ehtagconnector.azurewebsites.net/api/database
  constructor(
    private http: HttpClient,
  ) {
    this.hash = window.localStorage.getItem('EhTagHash');


    //
    // this.hash = from(window.localStorage.getItem('EhTagHash'))
    //   .pipe(
    //     filter(v => !!v),
    //     switchTap(() =>
    //       fromEvent(window, 'storage').pipe(
    //         map(v => {
    //           console.log(v);
    //           return v;
    //         })
    //       )
    //     )
    //   ).subscribe(e => {
    //
    //   });



    // this.hash = this.hashChange.pipe(filter(v => !!v));
    // this.hashChange.next();

  }


}
