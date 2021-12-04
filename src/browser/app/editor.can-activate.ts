import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, UrlTree, Router } from '@angular/router';
import { parseNamespace } from 'shared/namespace';

@Injectable()
export class CanActivateEditor implements CanActivate {
    constructor(private readonly router: Router) {}
    canActivate(route: ActivatedRouteSnapshot): boolean | UrlTree {
        const ns = route.params['namespace'] as string;
        const parsed = parseNamespace(ns);
        if (parsed === ns) return true;
        if (!parsed) return this.router.createUrlTree(['edit', 'invalid']);
        return this.router.createUrlTree(['edit', parsed, route.params['raw']], { queryParams: route.queryParams });
    }
}
