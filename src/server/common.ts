import 'source-map-support/register';
import { Promise } from 'bluebird';
Object.defineProperty(globalThis, 'Promise', { value: Promise, writable: false, enumerable: true });
