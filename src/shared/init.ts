import 'source-map-support/register';
import { Promise } from 'bluebird';

if (globalThis.Promise !== (Promise as unknown))
    Object.defineProperty(globalThis, 'Promise', {
        value: Promise,
        writable: false,
        enumerable: true,
        configurable: true,
    });
