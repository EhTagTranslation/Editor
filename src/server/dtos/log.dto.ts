import type { LogEntry } from '#server/utils/context-logger';
import { LoggerType } from '#shared/markdown/index';
import { ApiProperty } from '@nestjs/swagger';

export class LogEntryDto implements LogEntry {
    @ApiProperty({ enum: LoggerType, enumName: 'LoggerType', description: '日志类型', example: 'info' })
    logger!: LoggerType;
    @ApiProperty({ type: String, description: '日志消息', example: 'This is a log message' })
    message!: string;
}

export class WithLogEntriesDto {
    @ApiProperty({
        type: [LogEntryDto],
        description: '日志条目',
        example: [{ logger: 'info', message: 'This is a log message' }],
    })
    logs!: LogEntryDto[];
}
