import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, MatSort } from '@angular/material';
import { EhTagConnectorService } from '../../services/eh-tag-connector.service';
import { ETItem } from '../../interfaces/interface';
import { merge, Observable, of as observableOf, Subject, zip, of, combineLatest } from 'rxjs';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.sass']
})
export class ListComponent implements OnInit {


  constructor(
    private ehTagConnector: EhTagConnectorService,
    private route: ActivatedRoute,
    private router: Router,
  ) { }

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  search = '';
  loading = false;
  displayedColumns: Observable<ReadonlyArray<string>>;
  searchSubject: Subject<string> = new Subject();
  tags: Subject<ReadonlyArray<ETItem>> = new Subject();
  filteredTags: Observable<ReadonlyArray<ETItem>>;
  orderedTags: Observable<ReadonlyArray<ETItem>>;
  pagedTags: Observable<ReadonlyArray<ETItem>>;
  nsFilter: Observable<string>;

  clearNsFilter() {
    this.router.navigate(['/list']);
  }

  searchChange(text: string) {
    this.search = text;
    this.paginator.firstPage();
    this.searchSubject.next(text);
  }

  async ngOnInit() {
    this.nsFilter = this.route.paramMap.pipe(map(data => data.get('ns')));
    this.displayedColumns = this.nsFilter.pipe(map(ns => (ns
      ? ['raw', 'name', 'intro', 'handle']
      : ['namespace', 'raw', 'name', 'intro', 'handle'])));

    this.filteredTags = combineLatest(
      this.tags,
      this.nsFilter,
      this.searchSubject,
    ).pipe(map(data => this.getSearchData(data[0], data[1], data[2])));

    this.orderedTags = combineLatest(
      this.filteredTags,
      merge(
        of(null),
        this.sort.sortChange)
    ).pipe(map(data => this.getSortedData(data[0])));

    this.pagedTags = combineLatest(
      this.orderedTags,
      merge(
        of(null),
        this.paginator.page)
    ).pipe(map(data => this.getPagedData(data[0])));

    this.loading = true;
    this.ehTagConnector.getTags().then(tags => {
      this.tags.next(tags);
      this.searchChange(this.search);
    }).catch(console.log)
      .finally(() => this.loading = false);
  }

  private getPagedData(data: ReadonlyArray<ETItem>) {
    const startIndex = this.paginator.pageIndex * this.paginator.pageSize;
    return data.slice(startIndex, startIndex + this.paginator.pageSize);
  }

  private getSortedData(data: ReadonlyArray<ETItem>) {
    if (!this.sort.active || this.sort.direction === '') {
      return data;
    }

    return Array.from(data).sort((a, b) => {
      const isAsc = this.sort.direction === 'asc';
      return compare(a[this.sort.active], b[this.sort.active], isAsc);
    });
  }

  private getSearchData(data: ReadonlyArray<ETItem>, ns: string, search: string) {
    if (ns) {
      data = data.filter(v => v.namespace === ns);
    }
    data = data.filter(v => (
      v.name.indexOf(search) !== -1 ||
      v.intro.indexOf(search) !== -1 ||
      v.raw.indexOf(search) !== -1
    ));
    return data;
  }

}
function compare(a, b, isAsc) {
  return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
}
