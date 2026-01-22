import { Injectable, isDevMode } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class DebugService {
    log(...args: unknown[]): void {
        if (isDevMode()) {
            console.log(...args);
        }
    }
    error(...args: unknown[]): void {
        if (isDevMode()) {
            console.error(...args);
        }
    }
}
