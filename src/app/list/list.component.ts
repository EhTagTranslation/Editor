import { Component, OnInit, ViewChild, ViewEncapsulation, ElementRef } from '@angular/core';
import { MatPaginator, MatSort, PageEvent, SortDirection } from '@angular/material';
import { EhTagConnectorService } from '../../services/eh-tag-connector.service';
import { editableNs, ETKey } from '../../interfaces/ehtranslation';
import { merge, Observable, of as observableOf, Subject, zip, of, combineLatest } from 'rxjs';
import { ActivatedRoute, ParamMap, Router, Params } from '@angular/router';
import { map, tap, distinctUntilChanged, finalize } from 'rxjs/operators';
import { regexFromSearch } from '../shared/pipe/mark.pipe';
import { RouteService } from 'src/services/route.service';
import { DebugService } from 'src/services/debug.service';
import { TitleService } from 'src/services/title.service';
import { NamespaceName, Tag, NamespaceEnum } from 'src/interfaces/ehtag';
import { GithubReleaseService } from 'src/services/github-release.service';

interface RenderedETTag {
  renderedIntro: string;
  renderedLinks: string;
  renderedName: string;
  textIntro: string;
  textLinks: string;
  textName: string;
}

export interface ETItem extends Tag<'raw'>, ETKey { }

export interface RenderedETItem extends Tag<'raw'>, RenderedETTag, ETKey { }

function compare(a: any, b: any, isAsc: boolean) {
  return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
}

const nsScore: {
  [k in NamespaceName]: number;
} = {
  rows: 5,
  female: 1.2,
  male: 1.18,
  misc: 1.17,
  language: 1,
  artist: 1.15,
  group: 1.1,
  parody: 1.05,
  character: 1.15,
  reclass: 1,
};

const sortByNs = (data: RenderedETItem[]) => {
  return data.sort((a, b) => nsScore[b.namespace] - nsScore[a.namespace]);
};

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
    private githubRelease: GithubReleaseService,
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
  namespace: Observable<NamespaceName | null>;

  sortBy: Observable<SortableKeys | null>;
  sortDirection: Observable<SortDirection>;

  editableNs = editableNs;

  setNs(ns?: NamespaceName) {
    const list = ns && ns in NamespaceEnum ? ['/list', ns] : ['/list'];
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
    this.namespace = this.router.initParam('namespace', ns => ns && ns in NamespaceEnum ? ns as NamespaceName : null);
    this.search = this.router.initQueryParam('search', s => s || '', s => this.title.setTitle(s));
    this.showImg = this.router.initQueryParam('showImg', b => b === 'all' ? 'all' : b === 'no-nsfw' ? 'no-nsfw' : 'none', val => {
      if (val === 'all') {
        addStyle.innerHTML = '';
      } else if (val === 'none') {
        addStyle.innerHTML = 'app-list table td .md-container img[ehimg]{display:none;}';
      } else {
        addStyle.innerHTML = 'app-list table td .md-container img[ehimg][nsfw]{filter:blur(10px);transform: scale(0.9);}';
      }
    });
    this.pageSize = this.router.initQueryParam('pageSize', v => parseInt(v || '10', 10));
    this.pageIndex = this.router.initQueryParam('pageIndex', v => parseInt(v || '0', 10));
    this.sortBy = this.router.initQueryParam('sortBy', v => (v || '') in sortKeyMap ? v as SortableKeys : null);
    this.sortDirection = this.router.initQueryParam('sortDirection', v => (v || '') as SortDirection);

    this.displayedColumns = this.namespace.pipe(map(ns => (ns
      ? ['handle', 'raw', 'name', 'intro', 'links']
      : ['handle', 'namespace', 'raw', 'name', 'intro', 'links'])));

    this.filteredTags = combineLatest([
      this.tags,
      this.namespace,
      this.search,
    ]).pipe(map(data => this.getFilteredData(...data)));

    this.orderedTags = combineLatest([
      this.filteredTags,
      this.sortBy,
      this.sortDirection,
    ]).pipe(map(data => this.getSortedData(...data)));

    this.pagedTags = combineLatest([
      this.orderedTags,
      this.pageIndex,
      this.pageSize,
    ]).pipe(map(data => this.getPagedData(...data)));

    this.loading = true;
    this.getData().pipe(map(sortByNs), finalize(() => this.loading = false))
      .subscribe(v => this.tags.next(v));
  }

  private getData() {
    return zip(this.githubRelease.getTags('html'), this.githubRelease.getTags('text'), this.githubRelease.getTags('raw'))
      .pipe(map(data => {
        const tags: RenderedETItem[] = [];
        const dataHtml = data[0];
        const dataText = data[1];
        const dataRaw = data[2];
        dataRaw.data.forEach(namespaceRaw => {
          const namespaceHtml = dataHtml.data.find(ns => ns.namespace === namespaceRaw.namespace);
          const namespaceText = dataText.data.find(ns => ns.namespace === namespaceRaw.namespace);
          if (!namespaceHtml || !namespaceText) {
            return;
          }
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
        return tags;
      }));
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
      const getScore = <K extends keyof RenderedETItem>(t: RenderedETItem, k: K, weight: number) => {
        const str = t[k];
        if (str.search(regex.regex) !== -1) {
          return weight * regex.regex.source.length / str.length;
        } else {
          return 0;
        }
      };
      const scoredata = data.map(v => ({
        score: getScore(v, 'textIntro', 4) + getScore(v, 'textName', 20) + getScore(v, 'textLinks', 1) + getScore(v, 'raw', 50),
        tag: v,
      })).filter(sv => sv.score > 0);
      scoredata.sort((a, b) => b.score - a.score);
      data = scoredata.map(sv => sv.tag);
    }
    return data;
  }
}
