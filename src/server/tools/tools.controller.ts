import { Controller, Post, Body, HttpCode, HttpStatus, Param, BadRequestException } from '@nestjs/common';
import { TagResponseDto, LooseTagDto } from '../dtos/repo-info.dto.js';
import { Format } from '../decorators/format.decorator.js';
import type { TagType } from '#shared/interfaces/ehtag';
import { TagRecord } from '#shared/tag-record';
import { InjectableBase } from '../injectable-base.js';
import { DatabaseService } from '../database/database.service.js';
import { RawTag } from '#shared/raw-tag';
import { ApiOperation, ApiConsumes, ApiTags, ApiProduces, ApiOkResponse, ApiBody } from '@nestjs/swagger';
import { TagParams, ParsedLine } from './tools.dto.js';
import { Context } from '#shared/markdown/index';

@ApiTags('Tools')
@Controller('tools')
export class ToolsController extends InjectableBase {
    constructor(private readonly db: DatabaseService) {
        super();
    }

    @Post('normalize')
    @ApiOperation({ summary: '格式化条目', description: '使用此 API 在不修改数据库的情况下格式化条目' })
    @HttpCode(HttpStatus.OK)
    normalize(@Body() tag: LooseTagDto, @Format() format: TagType): TagResponseDto {
        const record = new TagRecord(tag, this.db.data.data.other);
        return record.render(format, new Context(record));
    }

    @Post('serialize/:raw')
    @ApiOperation({
        summary: '序列化条目',
        description: '使用此 API 在不修改数据库的情况下将条目序列化为 MarkDown 表格行',
    })
    @ApiProduces('text/plain')
    @ApiOkResponse({
        content: {
            'text/plain': {
                example: '| raw | name | intro | links |',
            },
        },
    })
    @HttpCode(HttpStatus.OK)
    serialize(@Param() p: TagParams, @Body() tag: LooseTagDto): string {
        const record = new TagRecord(tag, this.db.data.data.other);
        return record.stringify(new Context(record, RawTag(p.raw)));
    }

    @Post('parse')
    @ApiOperation({ summary: '解析 MarkDown 条目', description: '使用此 API 解析数据库中的 MarkDown 表格行' })
    @ApiBody({})
    @ApiConsumes('text/plain')
    @HttpCode(HttpStatus.OK)
    parse(@Body() line: string, @Format() format: TagType): ParsedLine {
        if (line.indexOf('\n') >= 0) throw new BadRequestException('Parse one line at once');
        line = line.trim();
        const parsed = TagRecord.parse(line, this.db.data.data.other);
        if (!parsed) throw new BadRequestException('Invalid markdown table row');
        return {
            key: parsed[0],
            value: parsed[1].render(format, new Context(parsed[1], parsed[0])),
        };
    }
}
