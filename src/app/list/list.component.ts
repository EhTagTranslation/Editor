import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, MatSort } from '@angular/material';
import {EhTagConnectorService} from '../../service/eh-tag-connector.service';
import {ETItem} from '../../interface';
import {merge, Observable, of as observableOf, Subject} from 'rxjs';
import {map} from 'rxjs/operators';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css']
})
export class ListComponent implements OnInit {


  constructor(
    private ehTagConnector: EhTagConnectorService,
  ) {}

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  search = '';
  loading = false;
  displayedColumns = ['namespace', 'raw', 'name'];
  dataSource: Observable<ETItem[]>;
  searchSubject: Subject<string> = new Subject();
  tags: ETItem[] = [];

  searchChange(text) {
    this.search = text;
    this.paginator.firstPage();
    this.searchSubject.next(text);
  }

  async ngOnInit() {
    this.loading = true;
    try {
      this.tags = await this.ehTagConnector.getTags();
    } catch (e) {
      console.error(e);
    }

    this.dataSource = merge(
      observableOf(this.tags),
      this.paginator.page,
      this.sort.sortChange,
      this.searchSubject
    ).pipe(map(() => this.getPagedData(this.getSortedData(this.getSearchData([...this.tags])))));

    this.loading = false;
  }

  private getPagedData(data: ETItem[]) {
    const startIndex = this.paginator.pageIndex * this.paginator.pageSize;
    return data.splice(startIndex, this.paginator.pageSize);
  }

  private getSortedData(data: ETItem[]) {
    if (!this.sort.active || this.sort.direction === '') {
      return data;
    }

    return data.sort((a, b) => {
      const isAsc = this.sort.direction === 'asc';
      return compare(a[this.sort.active], b[this.sort.active], isAsc);
    });
  }

  private getSearchData(data: ETItem[]) {
    return data.filter(v => (
      v.name.indexOf(this.search) !== -1 ||
      v.raw.indexOf(this.search) !== -1
    ));
  }

}
function compare(a, b, isAsc) {
  return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
}
