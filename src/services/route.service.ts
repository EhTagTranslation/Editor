import { Injectable } from '@angular/core';
import { ActivatedRoute, Router, Params, ParamMap } from '@angular/router';
import { zip, Observable } from 'rxjs';
import { map, distinctUntilChanged, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class RouteService {

  constructor(
    private router: Router, ) { }

  navigate(route: ActivatedRoute, commands: any[], params: Params, replaceUrl: boolean = true) {
    route.queryParams.subscribe(data => {
      this.router.navigate(commands, {
        replaceUrl,
        queryParams: {
          ...data,
          ...params,
        }
      });
    });
  }

  navigateParam(route: ActivatedRoute, params: Params, replaceUrl: boolean = true) {
    zip(route.url, route.queryParams).subscribe(data => {
      this.router.navigate(data[0].map(seg => seg.path), {
        replaceUrl,
        queryParams: {
          ...data[1],
          ...params,
        }
      });
    });
  }

  private initParamImpl<V>(
    paramMap: Observable<ParamMap>,
    key: string,
    parse: ((v: string | null) => V),
    action?: ((v: V) => void)) {
    const value = paramMap.pipe(map(p => p.get(key)), distinctUntilChanged(), map(parse), tap(action));
    value.subscribe(v => null);
    return value;
  }

  initQueryParam<V>(route: ActivatedRoute, key: string, parse: ((v: string | null) => V), action?: ((v: V) => void)) {
    return this.initParamImpl(route.queryParamMap, key, parse, action);
  }

  initParam<V>(route: ActivatedRoute, key: string, parse: ((v: string | null) => V), action?: ((v: V) => void)) {
    return this.initParamImpl(route.paramMap, key, parse, action);
  }
}
