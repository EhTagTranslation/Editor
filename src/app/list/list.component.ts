import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { SortDirection } from '@angular/material';
import { editableNs, ETKey } from '../../interfaces/ehtranslation';
import { Observable, Subject, zip, combineLatest, BehaviorSubject } from 'rxjs';
import { Params } from '@angular/router';
import { map, tap, shareReplay, debounceTime, filter } from 'rxjs/operators';
import { regexFromSearch } from '../shared/pipe/mark.pipe';
import { RouteService } from 'src/services/route.service';
import { DebugService } from 'src/services/debug.service';
import { TitleService } from 'src/services/title.service';
import { NamespaceName, Tag, NamespaceEnum, RepoData } from 'src/interfaces/ehtag';
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
  rows: 10,
  female: 5,
  male: 4.995,
  misc: 4.5,
  language: 1,
  artist: 3,
  group: 2.5,
  parody: 4,
  character: 3.5,
  reclass: 1,
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

type ShowImgType = 'all' | 'no-r18' | 'no-r18g' | 'none';

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
  @ViewChild('root', { static: true }) root: ElementRef<HTMLDivElement>;

  showImg: Observable<ShowImgType>;
  search: Observable<string>;
  pageSize: Observable<number>;
  pageIndex: Observable<number>;
  loading = new BehaviorSubject<boolean>(true);
  displayedColumns: Observable<ReadonlyArray<string>>;
  tags: Observable<ReadonlyArray<RenderedETItem>>;
  usingRegex = new Subject<boolean | undefined>();
  filteredTags: Observable<ReadonlyArray<RenderedETItem>>;
  orderedTags: Observable<ReadonlyArray<RenderedETItem>>;
  pagedTags: Observable<ReadonlyArray<RenderedETItem>>;
  namespace: Observable<NamespaceName | null>;

  sortBy: Observable<SortableKeys | null>;
  sortDirection: Observable<SortDirection>;

  editableNs = editableNs;

  setNs(ns?: NamespaceName) {
    const list = ns && ns in NamespaceEnum ? ['/list', ns] : ['/list', 'all'];
    this.router.navigate(list, {
      pageIndex: 0,
    });
  }

  navigateParam(params: Params, replaceUrl: boolean = true) {
    this.router.navigateParam(params, replaceUrl);
  }

  async ngOnInit() {
    this.githubRelease.refresh();
    const addStyle = document.createElement('style');
    this.root.nativeElement.appendChild(addStyle);
    this.namespace = this.router.initParam('namespace', ns => ns && ns in NamespaceEnum ? ns as NamespaceName : null);
    this.search = this.router.initQueryParam('search', s => s || '', s => this.title.setTitle(s));
    this.showImg = this.router.initQueryParam('showImg', b => (b || 'none') as ShowImgType, val => {
      if (val === 'all') {
        addStyle.innerHTML = '';
      } else if (val === 'no-r18') {
        addStyle.innerHTML = 'app-list table td .md-container img[ehimg][nsfw]{filter:blur(10px);transform: scale(0.9);}';
      } else if (val === 'no-r18g') {
        addStyle.innerHTML = 'app-list table td .md-container img[ehimg][nsfw="R18G"]{filter:blur(10px);transform: scale(0.9);}';
      } else {
        addStyle.innerHTML = 'app-list table td .md-container img[ehimg]{display:none;}';
      }
    });
    this.pageSize = this.router.initQueryParam('pageSize', v => parseInt(v || '10', 10));
    this.pageIndex = this.router.initQueryParam('pageIndex', v => parseInt(v || '0', 10));
    this.sortBy = this.router.initQueryParam('sortBy', v => (v || '') in sortKeyMap ? v as SortableKeys : null);
    this.sortDirection = this.router.initQueryParam('sortDirection', v => (v || '') as SortDirection);

    this.displayedColumns = this.namespace.pipe(map(ns => (ns
      ? ['handle', 'raw', 'name', 'intro', 'links']
      : ['handle', 'namespace', 'raw', 'name', 'intro', 'links'])));

    this.tags = combineLatest([
      this.githubRelease.tags.html,
      this.githubRelease.tags.text,
      this.githubRelease.tags.raw,
    ]).pipe(
      filter(data => data[0].head.sha === data[1].head.sha && data[1].head.sha === data[2].head.sha),
      tap(() => this.loading.next(true)),
      map(data => this.getData(...data)),
      shareReplay(1),
    );

    this.filteredTags = combineLatest([
      this.tags,
      this.namespace,
      this.search.pipe(debounceTime(50)),
    ]).pipe(
      tap(() => this.loading.next(true)),
      map(data => this.getFilteredData(...data)),
      shareReplay(1),
    );

    this.orderedTags = combineLatest([
      this.filteredTags,
      combineLatest([
        this.sortBy,
        this.sortDirection,
      ]).pipe(debounceTime(1)),
    ]).pipe(
      tap(() => this.loading.next(true)),
      map(data => this.getSortedData(data[0], ...data[1])),
      shareReplay(1),
    );

    this.pagedTags = combineLatest([
      this.orderedTags,
      combineLatest([
        this.pageIndex,
        this.pageSize,
      ]).pipe(debounceTime(1)),
    ]).pipe(
      tap(() => this.loading.next(true)),
      map(data => this.getPagedData(data[0], ...data[1])),
      shareReplay(1),
      tap(() => this.loading.next(false)),
    );
  }
  pasting(ev: ClipboardEvent) {
    if (!(ev.target instanceof HTMLInputElement)) {
      return;
    }
    const data = ev.clipboardData && ev.clipboardData.getData('Text');
    if (!data) {
      return;
    }
    ev.preventDefault();
    ev.target.setRangeText(data.trim().replace('\t', ' '), ev.target.selectionStart || 0, ev.target.selectionEnd || 0, 'end');
    this.router.navigateParam({
      search: ev.target.value,
    });
  }

  private getData(dataHtml: RepoData<'html'>, dataText: RepoData<'text'>, dataRaw: RepoData<'raw'>) {
    this.debug.log('list: fetching', arguments);
    const tags: RenderedETItem[] = [];
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
    return tags.sort((a, b) => nsScore[b.namespace] - nsScore[a.namespace]);
  }

  private getPagedData(data: ReadonlyArray<RenderedETItem>, pageIndex: number, pageSize: number) {
    this.debug.log('list: paging', arguments);
    const startIndex = pageIndex * pageSize;
    return data.slice(startIndex, startIndex + pageSize);
  }

  private getSortedData(data: ReadonlyArray<RenderedETItem>, sortBy: SortableKeys | null, sortDirection: SortDirection) {
    this.debug.log('list: sorting', arguments);

    if (!sortBy || !(sortBy in sortKeyMap) || sortDirection === '') {
      return data;
    }

    return Array.from(data).sort((a, b) => {
      const isAsc = sortDirection === 'asc';
      return compare(a[sortKeyMap[sortBy]], b[sortKeyMap[sortBy]], isAsc);
    });
  }

  private getFilteredData(data: ReadonlyArray<RenderedETItem>, ns: string | null, search: string) {
    this.debug.log('list: filtering', arguments);
    const regex = regexFromSearch(search);
    if (ns) {
      data = data.filter(v => v.namespace === ns);
    }
    this.usingRegex.next(regex.isRegex);
    if (regex.regex) {
      const getScore: <K extends keyof RenderedETItem>(t: RenderedETItem, k: K, weight: number) => number
        = regex.isRegex
          ? (t, k, weight) => {
            const str = t[k];
            if (str.search(regex.regex) !== -1) {
              return weight * regex.regex.source.length / str.length;
            } else {
              return 0;
            }
          }
          : (t, k, weight) => {
            const str = t[k];
            if (str.includes(regex.string)) {
              const score = weight * regex.string.length / str.length;
              if (str.startsWith(regex.string)) {
                return score * 2;
              }
              return score;
            } else {
              return 0;
            }
          };
      const scoredata = data.map(v => ({
        score: nsScore[v.namespace] *
          (getScore(v, 'textIntro', 4) + getScore(v, 'textName', 20) + getScore(v, 'textLinks', 1) + getScore(v, 'raw', 50)),
        tag: v,
      })).filter(sv => sv.score > 0);
      scoredata.sort((a, b) => b.score - a.score);
      data = scoredata.map(sv => sv.tag);
    }
    return data;
  }
}
