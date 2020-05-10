import { Tag, NamespaceEnum } from 'src/interfaces/ehtag';
import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class DbRepoService {
    readonly root = 'https://github.com/EhTagTranslation/Database/';

    resolve(path: string): string {
        return new URL(path, this.root).href;
    }

    issue(raw: string, ns?: NamespaceEnum, isNew = false): string {
        const title = encodeURIComponent(`${isNew ? '添加' : '更改'}标签 - ${ns ? `${ns}:${raw}` : raw}`);
        return this.resolve(`issues/new?assignees=&labels=翻译&template=tag-translation.md&title=${title}`);
    }

    code(page: string): string {
        return this.resolve(`blob/master/${encodeURI(page)}`);
    }
}
