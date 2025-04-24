import { type Context, Logger, type LoggerType } from '#shared/markdown/context';

export interface LogEntry {
    logger: LoggerType;
    message: string;
}

export class LoggerCollector extends Logger {
    private readonly _logs = new WeakMap<Context, LogEntry[]>();

    /** @inheritdoc */
    protected log(logger: LoggerType, context: Context, message: string): void {
        let logs = this._logs.get(context);
        if (!logs) {
            logs = [];
            this._logs.set(context, logs);
        }
        logs.push({ logger, message });
    }

    /** 返回并删除收集的日志 */
    collect(context: Context): LogEntry[] {
        const logs = this._logs.get(context);
        if (!logs) return [];
        this._logs.delete(context);
        return logs;
    }
}
