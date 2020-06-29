import 'lazysizes';
import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

if (environment.production) {
    enableProdMode();
}

platformBrowserDynamic()
    .bootstrapModule(AppModule)
    .then((_) => {
        import('bluebird').then((Bluebird) => {
            const Zone = (window as any)['Zone'];
            Zone[Zone['__symbol__']('bluebird')](Bluebird.Promise);
        });
    })
    .catch((err) => console.error(err));
