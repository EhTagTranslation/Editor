import { Injectable, isDevMode } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class DebugService {
    log(...args: Parameters<typeof console.log>) {
        if (isDevMode()) {
            console.log(...args);
        }
    }
    error(...args: Parameters<typeof console.error>) {
        if (isDevMode()) {
            console.error(...args);
        }
    }
}
