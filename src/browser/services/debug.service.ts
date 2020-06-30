import { Injectable, isDevMode } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class DebugService {
    log(...args: Parameters<typeof console.log>): void {
        if (isDevMode()) {
            console.log(...args);
        }
    }
    error(...args: Parameters<typeof console.error>): void {
        if (isDevMode()) {
            console.error(...args);
        }
    }
}
