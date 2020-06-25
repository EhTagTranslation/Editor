import * as fs from 'fs-extra';
import * as path from 'path';
import * as execa from 'execa';

export class Database {
    constructor(public readonly path: string) {}
}
