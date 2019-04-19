import { Component, OnInit, ViewChild, ViewEncapsulation, ElementRef } from '@angular/core';
import { MatPaginator, MatSort, PageEvent, SortDirection } from '@angular/material';
import { EhTagConnectorService } from '../../services/eh-tag-connector.service';
import { ETItem, ETTag, RenderedETItem, ETNamespaceName, ETNamespaceEnum, editableNs } from '../../interfaces/ehtranslation';
import { merge, Observable, of as observableOf, Subject, zip, of, combineLatest } from 'rxjs';
import { ActivatedRoute, ParamMap, Router, Params } from '@angular/router';
import { map, tap, distinctUntilChanged } from 'rxjs/operators';
import { regexFromSearch } from '../shared/pipe/mark.pipe';
import { RouteService } from 'src/services/route.service';
import { DebugService } from 'src/services/debug.service';
import { TitleService } from 'src/services/title.service';


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
    private router: RouteService,
    private debug: DebugService,
    private title: TitleService,
  ) { }
  @ViewChild('root') root: ElementRef<HTMLDivElement>;

  showImg: Observable<'all' | 'no-nsfw' | 'none'>;
  search: Observable<string>;
  pageSize: Observable<number>;
  pageIndex: Observable<number>;
  loading = false;
  displayedColumns: Observable<ReadonlyArray<string>>;
  tags = new Subject<ReadonlyArray<RenderedETItem>>();
  usingRegex = new Subject<boolean>();
  filteredTags: Observable<ReadonlyArray<RenderedETItem>>;
  orderedTags: Observable<ReadonlyArray<RenderedETItem>>;
  pagedTags: Observable<ReadonlyArray<RenderedETItem>>;
  namespace: Observable<ETNamespaceName | null>;
  sortBy: Observable<SortableKeys | null>;
  sortDirection: Observable<SortDirection>;

  editableNs = editableNs;

  setNs(ns?: ETNamespaceName) {
    const list = ns && ns in ETNamespaceEnum ? ['/list', ns] : ['/list'];
    this.router.navigate(list, {
      pageIndex: 0,
    });
  }

  navigateParam(params: Params, replaceUrl: boolean = true) {
    this.router.navigateParam(params, replaceUrl);
  }

  async ngOnInit() {
    const addStyle = document.createElement('style');
    this.root.nativeElement.appendChild(addStyle);
    this.namespace = this.router.initParam('namespace', ns => ns && ns in ETNamespaceEnum ? ns as ETNamespaceName : null);
    this.search = this.router.initQueryParam('search', s => s || '', s => this.title.setTitle(s));
    this.showImg = this.router.initQueryParam('showImg', b => b === 'all' ? 'all' : b === 'no-nsfw' ? 'no-nsfw' : 'none', val => {
      if (val === 'all') {
        addStyle.innerHTML = '';
      } else if (val === 'none') {
        addStyle.innerHTML = 'app-list table td img[ehimg]{display:none;}';
      } else {
        addStyle.innerHTML = 'app-list table td img[ehimg][nsfw]{filter:blur(10px);transform: scale(0.9);}';
      }
    });
    this.pageSize = this.router.initQueryParam('pageSize', v => parseInt(v || '10', 10));
    this.pageIndex = this.router.initQueryParam('pageIndex', v => parseInt(v || '0', 10));
    this.sortBy = this.router.initQueryParam('sortBy', v => (v || '') in sortKeyMap ? v as SortableKeys : null);
    this.sortDirection = this.router.initQueryParam('sortDirection', v => (v || '') as SortDirection);

    this.displayedColumns = this.namespace.pipe(map(ns => (ns
      ? ['handle', 'raw', 'name', 'intro', 'links']
      : ['handle', 'namespace', 'raw', 'name', 'intro', 'links'])));

    this.filteredTags = combineLatest(
      this.tags,
      this.namespace,
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
    }).catch(this.debug.log.bind(this))
      .finally(() => this.loading = false);
  }

  private getPagedData(data: ReadonlyArray<RenderedETItem>, pageIndex: number, pageSize: number) {
    this.debug.log('paging');
    const startIndex = pageIndex * pageSize;
    return data.slice(startIndex, startIndex + pageSize);
  }

  private getSortedData(data: ReadonlyArray<RenderedETItem>, sortBy: SortableKeys | null, sortDirection: SortDirection) {
    this.debug.log('sorting');

    if (!sortBy || !(sortBy in sortKeyMap) || sortDirection === '') {
      return data;
    }

    return Array.from(data).sort((a, b) => {
      const isAsc = sortDirection === 'asc';
      return compare(a[sortKeyMap[sortBy]], b[sortKeyMap[sortBy]], isAsc);
    });
  }

  private getFilteredData(data: ReadonlyArray<RenderedETItem>, ns: string | null, search: string) {
    this.debug.log('filtering');
    const regex = regexFromSearch(search);
    if (ns) {
      data = data.filter(v => v.namespace === ns);
    }
    this.usingRegex.next(regex.isRegex);
    if (regex.regex) {
      data = data.filter(v => (
        v.textIntro.search(regex.regex) !== -1 ||
        v.textName.search(regex.regex) !== -1 ||
        v.textLinks.search(regex.regex) !== -1 ||
        v.raw.search(regex.regex) !== -1
      ));
    }
    return data;
  }

}
