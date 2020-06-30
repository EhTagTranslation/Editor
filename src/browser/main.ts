import 'lazysizes';
import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

async function main(): Promise<void> {
    if (environment.production) {
        enableProdMode();
    }
    await platformBrowserDynamic().bootstrapModule(AppModule);
    const { Promise } = await import('bluebird');
    const bluebirdPatchSymbol = Zone.__symbol__('bluebird') as keyof ZoneType;
    const bluebirdPatch = Zone[bluebirdPatchSymbol] as (b: typeof Promise) => void;
    bluebirdPatch(Promise);
}

main().catch((err) => console.error(err));
