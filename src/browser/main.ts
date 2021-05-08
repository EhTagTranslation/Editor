/// <reference types="zone.js/zone.js" />

import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import Bluebird from 'bluebird';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

async function main(): Promise<void> {
    if (environment.production) {
        enableProdMode();
    }
    await platformBrowserDynamic().bootstrapModule(AppModule);

    const bluebirdPatchSymbol = Zone.__symbol__('bluebird') as keyof ZoneType;
    const bluebirdPatch = Zone[bluebirdPatchSymbol] as (b: typeof Bluebird) => void;
    bluebirdPatch(Bluebird);
}

main().catch((err) => console.error(err));
