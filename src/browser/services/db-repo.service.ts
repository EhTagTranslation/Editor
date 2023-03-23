import type { NamespaceName } from '#shared/interfaces/ehtag';
import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class DbRepoService {
    readonly root = 'https://github.com/EhTagTranslation/Database/';

    resolve(path: string): string {
        return new URL(path, this.root).href;
    }

    issue(
        raw: string,
        ns?: NamespaceName,
        isNew: boolean | null = false,
        name?: string,
        intro?: string,
        links?: string,
    ): string {
        const query = new URLSearchParams('template=tag-translation.yml');
        query.set('title', `${isNew ? '添加' : '更改'}标签 - ${ns ? `${ns}:${raw}` : raw}`);
        name && query.set('name', name);
        intro && query.set('intro', intro);
        links && query.set('links', links);
        return this.resolve(`issues/new?${query.toString()}`);
    }

    code(page: string): string {
        return this.resolve(`blob/master/${encodeURI(page)}`);
    }

    edit(page: string): string {
        return this.resolve(`edit/master/${encodeURI(page)}`);
    }
}
