import { Component, OnInit, ViewChild, ViewEncapsulation, ElementRef } from '@angular/core';
import { MatPaginator, MatSort, PageEvent, SortDirection } from '@angular/material';
import { EhTagConnectorService } from '../../services/eh-tag-connector.service';
import { ETItem, ETTag, RenderedETItem } from '../../interfaces/interface';
import { merge, Observable, of as observableOf, Subject, zip, of, combineLatest } from 'rxjs';
import { ActivatedRoute, ParamMap, Router, Params } from '@angular/router';
import { map, tap, distinctUntilChanged } from 'rxjs/operators';
import { regexFromSearch } from '../shared/pipe/mark.pipe';


function compare(a: any, b: any, isAsc: boolean) {
  return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
}

const sortKeyMap: {
  [x in keyof ETItem]: keyof RenderedETItem;
} = {
  namespace: 'namespace',
  raw: 'raw',
  name: 'textName',
  intro: 'textIntro',
  links: 'textLinks',
};

type SortableKeys = keyof typeof sortKeyMap;

@Component({
  selector: 'app-list',
  encapsulation: ViewEncapsulation.None,
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.sass']
})
export class ListComponent implements OnInit {


  constructor(
    private ehTagConnector: EhTagConnectorService,
    private route: ActivatedRoute,
    private router: Router,
  ) { }
  @ViewChild('root') root: ElementRef<HTMLDivElement>;

  showImg: Observable<'all' | 'no-nsfw' | 'none'>;
  search: Observable<string>;
  pageSize: Observable<number>;
  pageIndex: Observable<number>;
  loading = false;
  displayedColumns: Observable<ReadonlyArray<string>>;
  tags: Subject<ReadonlyArray<RenderedETItem>> = new Subject();
  filteredTags: Observable<ReadonlyArray<RenderedETItem>>;
  orderedTags: Observable<ReadonlyArray<RenderedETItem>>;
  pagedTags: Observable<ReadonlyArray<RenderedETItem>>;
  ns: Observable<string | null>;
  sortBy: Observable<SortableKeys | null>;
  sortDirection: Observable<SortDirection>;

  setNs(ns?: string) {
    const list = ns ? ['/list', ns] : ['/list'];
    this.route.queryParams.subscribe(data => this.router.navigate(list, {
      replaceUrl: true,
      queryParams: {
        ...data,
        pageIndex: 0,
      }
    }));
  }

  navigateParam(params: Params, replaceUrl: boolean = true) {
    zip(this.route.url, this.route.queryParams).subscribe(data => {
      this.router.navigate(data[0].map(seg => seg.path), {
        replaceUrl,
        queryParams: {
          ...data[1],
          ...params,
        }
      });
    });
  }

  private initQueryParam<V>(key: keyof this & string, parse: ((v: string | null) => V), action?: ((v: V) => void)) {
    if (action) {
      return this.route.queryParamMap.pipe(map(p => parse(p.get(key))), distinctUntilChanged(), tap(action));
    } else {
      return this.route.queryParamMap.pipe(map(p => parse(p.get(key))), distinctUntilChanged());
    }
  }
  private initParam<V>(key: keyof this & string, parse: ((v: string | null) => V), action?: ((v: V) => void)) {
    if (action) {
      return this.route.paramMap.pipe(map(p => parse(p.get(key))), distinctUntilChanged(), tap(action));
    } else {
      return this.route.paramMap.pipe(map(p => parse(p.get(key))), distinctUntilChanged());
    }
  }

  async ngOnInit() {
    const addStyle = document.createElement('style');
    this.root.nativeElement.appendChild(addStyle);

    this.ns = this.initParam('ns', ns => ns || null);
    this.search = this.initQueryParam('search', s => s || '');
    this.showImg = this.initQueryParam('showImg', b => b === 'all' ? 'all' : b === 'none' ? 'none' : 'no-nsfw', val => {
      if (val === 'all') {
        addStyle.innerHTML = '';
      } else if (val === 'none') {
        addStyle.innerHTML = 'app-list table td img{display:none;}';
      } else {
        addStyle.innerHTML = 'app-list table td img[nsfw]{display:none;}';
      }
    });
    this.pageSize = this.initQueryParam('pageSize', v => parseInt(v || '10', 10));
    this.pageIndex = this.initQueryParam('pageIndex', v => parseInt(v || '0', 10));
    this.sortBy = this.initQueryParam('sortBy', v => (v || '') in sortKeyMap ? v as SortableKeys : null);
    this.sortDirection = this.initQueryParam('sortDirection', v => (v || '') as SortDirection);

    this.displayedColumns = this.ns.pipe(map(ns => (ns
      ? ['handle', 'raw', 'name', 'intro', 'links']
      : ['handle', 'namespace', 'raw', 'name', 'intro', 'links'])));

    this.filteredTags = combineLatest(
      this.tags,
      this.ns,
      this.search,
    ).pipe(map(data => this.getFilteredData(...data)));

    this.orderedTags = combineLatest(
      this.filteredTags,
      this.sortBy,
      this.sortDirection,
    ).pipe(map(data => this.getSortedData(...data)));

    this.pagedTags = combineLatest(
      this.orderedTags,
      this.pageIndex,
      this.pageSize,
    ).pipe(map(data => this.getPagedData(...data)));

    this.loading = true;
    this.ehTagConnector.getTags().then(tags => {
      this.tags.next(tags);
    }).catch(console.log)
      .finally(() => this.loading = false);
  }

  private getPagedData(data: ReadonlyArray<RenderedETItem>, pageIndex: number, pageSize: number) {
    console.log('paging');
    const startIndex = pageIndex * pageSize;
    return data.slice(startIndex, startIndex + pageSize);
  }

  private getSortedData(data: ReadonlyArray<RenderedETItem>, sortBy: SortableKeys | null, sortDirection: SortDirection) {
    console.log('sorting');

    if (!sortBy || !(sortBy in sortKeyMap) || sortDirection === '') {
      return data;
    }

    return Array.from(data).sort((a, b) => {
      const isAsc = sortDirection === 'asc';
      return compare(a[sortKeyMap[sortBy]], b[sortKeyMap[sortBy]], isAsc);
    });
  }

  private getFilteredData(data: ReadonlyArray<RenderedETItem>, ns: string | null, search: string) {
    console.log('filtering');
    const regex = regexFromSearch(search);
    if (ns) {
      data = data.filter(v => v.namespace === ns);
    }
    if (regex) {
      data = data.filter(v => (
        v.textIntro.search(regex) !== -1 ||
        v.textName.search(regex) !== -1 ||
        v.raw.search(regex) !== -1
      ));
    }
    return data;
  }

}
