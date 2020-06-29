import { Controller, Get, Post, Body, HttpCode, HttpStatus, Param, BadRequestException } from '@nestjs/common';
import { TagDto, TagResponseDto } from 'server/dtos/repo-info.dto';
import { Format } from 'server/decorators/format.decorator';
import { TagType } from 'shared/interfaces/ehtag';
import { TagRecord } from 'shared/tag-record';
import { InjectableBase } from 'server/injectable-base';
import { DatabaseService } from 'server/database/database.service';
import { RawTag } from 'shared/validate';
import { ApiOperation, ApiConsumes, ApiTags, ApiProduces, ApiOkResponse, ApiBody } from '@nestjs/swagger';
import { TagParams, ParsedLine } from './tools.dto';

@ApiTags('Tools')
@Controller('tools')
export class ToolsController extends InjectableBase {
    constructor(private readonly db: DatabaseService) {
        super();
    }

    @Post('normalize')
    @ApiOperation({ summary: '格式化条目', description: '使用此 API 在不修改数据库的情况下格式化条目' })
    @HttpCode(HttpStatus.OK)
    normalize(@Body() tag: TagDto, @Format() format: TagType): TagResponseDto {
        return new TagRecord(tag, this.db.data.data.misc).render(format, {
            database: this.db.data,
            namespace: this.db.data.data.misc,
            raw: 'raw' as RawTag,
        });
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
    serialize(@Param() p: TagParams, @Body() tag: TagDto): string {
        return new TagRecord(tag, this.db.data.data.misc).stringify({
            database: this.db.data,
            namespace: this.db.data.data.misc,
            raw: p.raw,
        });
    }

    @Post('parse')
    @ApiOperation({ summary: '解析 MarkDown 条目', description: '使用此 API 解析数据库中的 MarkDown 表格行' })
    @ApiBody({})
    @ApiConsumes('text/plain')
    @HttpCode(HttpStatus.OK)
    parse(@Body() line: string, @Format() format: TagType): ParsedLine {
        if (line.indexOf('\n') >= 0) throw new BadRequestException('Parse one line at once');
        line = line.trim();
        const parsed = TagRecord.parse(line, this.db.data.data.misc);
        if (!parsed) throw new BadRequestException('Invalid markdown table row');
        return {
            key: parsed[0],
            value: parsed[1].render(format, {
                database: this.db.data,
                namespace: this.db.data.data.misc,
                raw: parsed[0],
            }),
        };
    }
}
