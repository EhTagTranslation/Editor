import { Injectable } from '@angular/core';
import { ActivatedRoute, Router, Params, ParamMap } from '@angular/router';
import { zip, Observable } from 'rxjs';
import { map, distinctUntilChanged, tap } from 'rxjs/operators';
import { Title } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root'
})
export class TitleService  {

  constructor(private title: Title) {  }
  getTitle() { return this.title.getTitle(); }
  setTitle(newTitle: string) {
    newTitle
      ? this.title.setTitle(newTitle + ' - EhTag Editor')
      : this.title.setTitle('EhTag Editor');
  }
}
