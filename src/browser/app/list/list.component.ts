import { Component, OnInit } from '@angular/core';
import { SortDirection } from '@angular/material/sort';
import { editableNs, ETKey } from '../../interfaces/ehtranslation';
import { Observable, Subject, combineLatest, BehaviorSubject, from } from 'rxjs';
import { Params } from '@angular/router';
import { map, tap, shareReplay, debounceTime, filter, mergeMap } from 'rxjs/operators';
import { regexFromSearch } from '../shared/pipe/mark.pipe';
import { RouteService } from 'browser/services/route.service';
import { DebugService } from 'browser/services/debug.service';
import { TitleService } from 'browser/services/title.service';
import { NamespaceName, Tag, RepoData } from 'shared/interfaces/ehtag';
import { GithubReleaseService } from 'browser/services/github-release.service';
import { isNamespaceName } from 'shared/validate';

export interface ETItem extends Tag<'raw'>, ETKey {}

export interface RenderedETItem extends Tag<'raw'>, ETKey {
    renderedIntro: string;
    renderedLinks: string;
    renderedName: string;
    textIntro: string;
    textLinks: string;
    textName: string;
}

function compare(a: string, b: string, isAsc: boolean): number {
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
    styleUrls: ['./list.component.sass'],
})
export class ListComponent implements OnInit {
    constructor(
        private readonly githubRelease: GithubReleaseService,
        private readonly router: RouteService,
        private readonly debug: DebugService,
        private readonly title: TitleService,
    ) {}

    showImg!: Observable<ShowImgType>;
    search!: Observable<string>;
    pageSize!: Observable<number>;
    pageIndex!: Observable<number>;
    loading = new BehaviorSubject<boolean>(true);
    displayedColumns!: Observable<readonly string[]>;
    tags!: Observable<readonly RenderedETItem[]>;
    usingRegex = new Subject<boolean | undefined>();
    filteredTags!: Observable<readonly RenderedETItem[]>;
    orderedTags!: Observable<readonly RenderedETItem[]>;
    pagedTags!: Observable<readonly RenderedETItem[]>;
    namespace!: Observable<NamespaceName | null>;

    sortBy!: Observable<SortableKeys | null>;
    sortDirection!: Observable<SortDirection>;

    editableNs = editableNs;

    setNs(ns?: NamespaceName): void {
        const list = isNamespaceName(ns) ? ['/list', ns] : ['/list', 'all'];
        this.router.navigate(list, {
            pageIndex: 0,
        });
    }

    navigateParam(params: Params, replaceUrl = true): void {
        this.router.navigateParam(params, replaceUrl);
    }

    ngOnInit(): void {
        this.githubRelease.refresh();
        this.namespace = this.router.initParam('namespace', (ns) => (isNamespaceName(ns) ? ns : null));
        this.search = this.router.initQueryParam(
            'search',
            (s) => s ?? '',
            (s) => (this.title.title = s),
        );
        this.showImg = this.router.initQueryParam('showImg', (b) => (b ?? 'none') as ShowImgType);
        this.pageSize = this.router.initQueryParam('pageSize', (v) => parseInt(v ?? '10', 10));
        this.pageIndex = this.router.initQueryParam('pageIndex', (v) => parseInt(v ?? '0', 10));
        this.sortBy = this.router.initQueryParam('sortBy', (v) =>
            (v || '') in sortKeyMap ? (v as SortableKeys) : null,
        );
        this.sortDirection = this.router.initQueryParam('sortDirection', (v) => (v ?? '') as SortDirection);

        this.displayedColumns = this.namespace.pipe(
            map((ns) =>
                ns
                    ? ['handle', 'raw', 'name', 'intro', 'links']
                    : ['handle', 'namespace', 'raw', 'name', 'intro', 'links'],
            ),
        );

        this.tags = this.githubRelease.tags.pipe(
            filter((tags) => tags.valid),
            tap(() => this.loading.next(true)),
            mergeMap((tags) => from(tags.render('full'))),
            map((data) => this.getData(data)),
            shareReplay(1),
        );

        this.filteredTags = combineLatest([this.tags, this.namespace, this.search.pipe(debounceTime(50))]).pipe(
            tap(() => this.loading.next(true)),
            tap(() => this.navigateParam({ pageIndex: 0 })),
            map((data) => this.getFilteredData(...data)),
            shareReplay(1),
        );

        this.orderedTags = combineLatest([
            this.filteredTags,
            combineLatest([this.sortBy, this.sortDirection]).pipe(debounceTime(1)),
        ]).pipe(
            tap(() => this.loading.next(true)),
            map((data) => this.getSortedData(data[0], ...data[1])),
            shareReplay(1),
        );

        this.pagedTags = combineLatest([
            this.orderedTags,
            combineLatest([this.pageIndex, this.pageSize]).pipe(debounceTime(1)),
        ]).pipe(
            tap(() => this.loading.next(true)),
            map((data) => this.getPagedData(data[0], ...data[1])),
            shareReplay(1),
            tap(() => this.loading.next(false)),
        );
    }
    copying(ev: ClipboardEvent): void {
        const data = getSelection()?.toString();
        const cb = ev.clipboardData;
        if (!cb || !data) return;
        cb.setData('Text', data.trim());
        ev.preventDefault();
    }
    pasting(ev: ClipboardEvent): void {
        if (!(ev.target instanceof HTMLInputElement)) {
            return;
        }
        const data = ev.clipboardData?.getData('Text');
        if (!data) {
            return;
        }
        ev.preventDefault();
        ev.target.setRangeText(
            data.trim().replace('\t', ' '),
            ev.target.selectionStart ?? 0,
            ev.target.selectionEnd ?? 0,
            'end',
        );
        this.router.navigateParam({
            search: ev.target.value,
        });
    }

    private getData(data: RepoData<'full'>): readonly RenderedETItem[] {
        this.debug.log('list: fetching', data);
        const tags: RenderedETItem[] = [];
        data.data.forEach((nsDb) => {
            for (const raw in nsDb.data) {
                const element = nsDb.data[raw];
                tags.push({
                    renderedIntro: element.intro.html,
                    renderedLinks: element.links.html,
                    renderedName: element.name.html,
                    textIntro: element.intro.text,
                    textLinks: element.links.text,
                    textName: element.name.text,
                    intro: element.intro.raw,
                    links: element.links.raw,
                    name: element.name.raw,
                    raw,
                    namespace: nsDb.namespace,
                });
            }
        });
        return tags.sort((a, b) => nsScore[b.namespace] - nsScore[a.namespace]);
    }

    private getPagedData(
        data: readonly RenderedETItem[],
        pageIndex: number,
        pageSize: number,
    ): readonly RenderedETItem[] {
        this.debug.log('list: paging', { data, pageIndex, pageSize });
        const startIndex = pageIndex * pageSize;
        return data.slice(startIndex, startIndex + pageSize);
    }

    private getSortedData(
        data: readonly RenderedETItem[],
        sortBy: SortableKeys | null,
        sortDirection: SortDirection,
    ): readonly RenderedETItem[] {
        this.debug.log('list: sorting', { data, sortBy, sortDirection });

        if (!sortBy || !(sortBy in sortKeyMap) || sortDirection === '') {
            return data;
        }

        return Array.from(data).sort((a, b) => {
            const isAsc = sortDirection === 'asc';
            return compare(a[sortKeyMap[sortBy]], b[sortKeyMap[sortBy]], isAsc);
        });
    }

    private getFilteredData(
        data: readonly RenderedETItem[],
        ns: string | null,
        search: string,
    ): readonly RenderedETItem[] {
        this.debug.log('list: filtering', { data, ns, search });
        const regex = regexFromSearch(search);
        if (ns) {
            data = data.filter((v) => v.namespace === ns);
        }
        this.usingRegex.next(regex.isRegex);
        if (regex.regex) {
            const getScore = <K extends keyof RenderedETItem>(t: RenderedETItem, k: K, weight: number): number => {
                const str = t[k];
                if (regex.regex.test(str)) {
                    const score = (weight * regex.data.length) / str.length;
                    if (regex.startRegex.test(str)) return score * 2;
                    return score;
                } else {
                    return 0;
                }
            };
            const scoreData = data
                .map((v) => ({
                    score:
                        nsScore[v.namespace] *
                        (getScore(v, 'textIntro', 4) +
                            getScore(v, 'textName', 20) +
                            getScore(v, 'textLinks', 1) +
                            getScore(v, 'raw', 50)),
                    tag: v,
                }))
                .filter((sv) => sv.score > 0);
            scoreData.sort((a, b) => b.score - a.score);
            data = scoreData.map((sv) => sv.tag);
        }
        return data;
    }
}
