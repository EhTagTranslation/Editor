import { error, notice, warning } from '@actions/core';
import { Context, Logger } from '#shared/markdown/index';
import { action } from '../../utils.js';

export class ActionLogger extends Logger {
    static override buildMessage(logger: keyof Logger, context: Context, message: string): string {
        return `${context.namespace.name}:${context.raw ?? '<unknown raw>'}: ${message}`;
    }
    readonly map: Record<keyof Logger, typeof notice> = {
        info: notice,
        warn: warning,
        error: error,
    };
    protected log(logger: 'info' | 'warn' | 'error', context: Context, message: string): void {
        this.map[logger](ActionLogger.buildMessage(logger, context, message), {
            file: `database/${context.namespace.name}.md`,
            startLine: context.line,
            startColumn: context.line ? context.column : undefined,
        });
        if (this.setFailed[logger]) {
            process.exitCode = action.ExitCode.Failure;
        }
    }
    readonly setFailed: Record<keyof Logger, boolean> = {
        info: false,
        warn: false,
        error: true,
    };

    constructor(readonly failed: keyof Logger = 'error') {
        super();
        switch (failed) {
            case 'info':
                this.setFailed.info = true;
            // fall through
            case 'warn':
                this.setFailed.warn = true;
            // fall through
            case 'error':
                this.setFailed.error = true;
        }
    }
}
