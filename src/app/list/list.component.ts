import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, MatSort } from '@angular/material';
import { ListDataSource } from './list-datasource';
import {EhTagConnectorService} from '../../service/eh-tag-connector.service';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css']
})
export class ListComponent implements OnInit {
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  dataSource: ListDataSource;

  /** Columns displayed in the table. Columns IDs can be added, removed, or reordered. */
  displayedColumns = ['Raw', 'Name', 'Describe', 'handle'];

  constructor(
    private ehTagConnector: EhTagConnectorService,
  ) {
    ehTagConnector.test();
  }

  ngOnInit() {
    this.dataSource = new ListDataSource(this.paginator, this.sort);
  }
}
