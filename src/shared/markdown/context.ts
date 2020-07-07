import type { TagRecord } from '../tag-record';
import type { RawTag } from '../validate';
import type { NamespaceDatabaseView, DatabaseView } from '../interfaces/database';
import type { Database } from '../database';
import { NamespaceName } from 'shared/interfaces/ehtag';

export abstract class Logger {
    info(context: Context, message: string): void {
        this.log('info', context, message);
    }
    warn(context: Context, message: string): void {
        this.log('warn', context, message);
    }
    error(context: Context, message: string): void {
        this.log('error', context, message);
    }
    protected abstract log(logger: keyof Logger, context: Context, message: string): void;

    static default: Logger = new (class DefaultLogger extends Logger {
        protected log(logger: keyof Logger, context: Context, message: string): void {
            console[logger](`${context.namespace.name}:${context.raw ?? '<unknown raw>'}: ${message}`);
        }
    })();
}

export class Context {
    constructor(tag: TagRecord, raw?: RawTag, logger?: Logger);
    constructor(namespace: NamespaceDatabaseView, raw?: RawTag, logger?: Logger);
    constructor(root: TagRecord | NamespaceDatabaseView, raw?: RawTag, logger?: Logger) {
        this.raw = raw;
        const nsv = root as NamespaceDatabaseView;
        if (typeof nsv.database == 'object' && typeof nsv.name == 'string' && typeof nsv.size == 'number') {
            this.namespace = nsv;
        } else {
            const tag = root as TagRecord;
            this.namespace = tag.namespace;
            this.tag = tag;
        }
        this.database = this.namespace.database;
        this.logger = logger ?? (this.database as Database).logger ?? Logger.default;
    }
    database: DatabaseView;
    namespace: NamespaceDatabaseView;
    raw?: RawTag;
    tag?: TagRecord;
    logger: Logger;
}
