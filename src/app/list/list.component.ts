import { Component, OnInit, ViewChild, ViewEncapsulation, ElementRef } from '@angular/core';
import { MatPaginator, MatSort, PageEvent, SortDirection } from '@angular/material';
import { EhTagConnectorService } from '../../services/eh-tag-connector.service';
import { ETItem, ETTag, RenderedETItem, ETNamespaceName, ETNamespaceEnum, editableNs } from '../../interfaces/ehtranslation';
import { merge, Observable, of as observableOf, Subject, zip, of, combineLatest } from 'rxjs';
import { ActivatedRoute, ParamMap, Router, Params } from '@angular/router';
import { map, tap, distinctUntilChanged } from 'rxjs/operators';
import { regexFromSearch } from '../shared/pipe/mark.pipe';
import { RouteService } from 'src/services/route.service';


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
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.sass']
})
export class ListComponent implements OnInit {


  constructor(
    private ehTagConnector: EhTagConnectorService,
    private route: ActivatedRoute,
    private router: RouteService,
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
  ns: Observable<ETNamespaceName | null>;
  sortBy: Observable<SortableKeys | null>;
  sortDirection: Observable<SortDirection>;

  editableNs = editableNs;

  setNs(ns?: ETNamespaceName) {
    const list = ns && ns in ETNamespaceEnum ? ['/list', ns] : ['/list'];
    this.router.navigate(this.route, list, {
      pageIndex: 0,
    });
  }

  navigateParam(params: Params, replaceUrl: boolean = true) {
    this.router.navigateParam(this.route, params, replaceUrl);
  }

  async ngOnInit() {
    const addStyle = document.createElement('style');
    this.root.nativeElement.appendChild(addStyle);
    this.ns = this.router.initParam(this.route, 'ns', ns => ns && ns in ETNamespaceEnum ? ns as ETNamespaceName : null);
    this.search = this.router.initQueryParam(this.route, 'search', s => s || '');
    this.showImg = this.router.initQueryParam(this.route, 'showImg', b => b === 'all' ? 'all' : b === 'none' ? 'none' : 'no-nsfw', val => {
      if (val === 'all') {
        addStyle.innerHTML = '';
      } else if (val === 'none') {
        addStyle.innerHTML = 'app-list table td img[ehimg]{display:none;}';
      } else {
        addStyle.innerHTML = 'app-list table td img[ehimg][nsfw]{filter:blur(10px);transform: scale(0.9);}';
      }
    });
    this.pageSize = this.router.initQueryParam(this.route, 'pageSize', v => parseInt(v || '10', 10));
    this.pageIndex = this.router.initQueryParam(this.route, 'pageIndex', v => parseInt(v || '0', 10));
    this.sortBy = this.router.initQueryParam(this.route, 'sortBy', v => (v || '') in sortKeyMap ? v as SortableKeys : null);
    this.sortDirection = this.router.initQueryParam(this.route, 'sortDirection', v => (v || '') as SortDirection);

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
        v.textLinks.search(regex) !== -1 ||
        v.raw.search(regex) !== -1
      ));
    }
    return data;
  }

}
