import { Injectable } from '@angular/core';
import { ActivatedRoute, Router, Params, ParamMap } from '@angular/router';
import { zip, Observable } from 'rxjs';
import { map, distinctUntilChanged, tap, shareReplay } from 'rxjs/operators';

@Injectable({
    providedIn: 'root',
})
export class RouteService {
    constructor(private router: Router, private route: ActivatedRoute) {}

    navigate(commands: any[], params: Params, replaceUrl = true) {
        this.router.navigate(commands, {
            replaceUrl,
            queryParams: {
                ...this.route.snapshot.queryParams,
                ...params,
            },
        });
    }

    navigateParam(params: Params, replaceUrl = true) {
        this.router.navigate(
            this.route.snapshot.url.map((seg) => seg.path),
            {
                replaceUrl,
                queryParams: {
                    ...this.route.snapshot.queryParams,
                    ...params,
                },
            },
        );
    }

    private initParamImpl<V>(
        paramMap: Observable<ParamMap>,
        key: string,
        parse: (v: string | null) => V,
        action?: (v: V) => void,
    ) {
        const value = paramMap.pipe(
            map((p) => p.get(key)),
            distinctUntilChanged(),
            map(parse),
            distinctUntilChanged(),
            tap(action),
            shareReplay(1),
        );
        value.subscribe((_) => {});
        return value;
    }

    initQueryParam<V>(key: string, parse: (v: string | null) => V, action?: (v: V) => void) {
        const route = this.router.routerState.root.firstChild ?? this.router.routerState.root;
        return this.initParamImpl(route.queryParamMap, key, parse, action);
    }

    initParam<V>(key: string, parse: (v: string | null) => V, action?: (v: V) => void) {
        const route = this.router.routerState.root.firstChild ?? this.router.routerState.root;
        return this.initParamImpl(route.paramMap, key, parse, action);
    }
}
