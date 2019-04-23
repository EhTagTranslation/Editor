import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-github-corner',
  templateUrl: './github-corner.component.html',
  styleUrls: ['./github-corner.component.sass']
})
export class GithubCornerComponent implements OnInit {

  @Input() href: string;
  @Input() target: string;
  hover = false;
  constructor() { }

  ngOnInit() {
  }
}
