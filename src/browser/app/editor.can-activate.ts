import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { parseNamespace } from '#shared/namespace';

export const canActivate: CanActivateFn = (route) => {
    const ns = route.params['namespace'] as string;
    const parsed = parseNamespace(ns);
    if (parsed === ns) return true;
    const router = inject(Router);
    if (!parsed) return router.createUrlTree(['edit', 'invalid']);
    return router.createUrlTree(['edit', parsed, route.params['raw']], { queryParams: route.queryParams });
};
