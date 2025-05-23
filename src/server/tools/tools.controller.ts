import { Controller, Post, Body, HttpCode, HttpStatus, Param, BadRequestException } from '@nestjs/common';
import { LooseTagDto } from '../dtos/repo-info.dto.js';
import { Format } from '../decorators/format.decorator.js';
import type { TagType } from '#shared/interfaces/ehtag';
import { TagRecord } from '#shared/tag-record';
import { InjectableBase } from '../injectable-base.js';
import { DatabaseService } from '../database/database.service.js';
import { RawTag } from '#shared/raw-tag';
import { ApiOperation, ApiConsumes, ApiTags, ApiProduces, ApiOkResponse, ApiBody } from '@nestjs/swagger';
import { TagParams, ParsedLine, TagNsParams, TagResponseLogDto } from './tools.dto.js';
import { Context } from '#shared/markdown/index';
import { LoggerCollector } from '../utils/context-logger.js';

@ApiTags('Tools')
@Controller('tools')
export class ToolsController extends InjectableBase {
    constructor(private readonly db: DatabaseService) {
        super();
    }

    private readonly collector = new LoggerCollector();

    @Post('normalize/:namespace')
    @ApiOperation({ summary: '格式化条目', description: '使用此 API 在不修改数据库的情况下格式化条目' })
    @HttpCode(HttpStatus.OK)
    @ApiOkResponse({ type: TagResponseLogDto })
    normalize(@Param() p: TagNsParams, @Body() tag: LooseTagDto, @Format() format: TagType): TagResponseLogDto {
        const record = new TagRecord(tag, this.db.data.data[p.namespace]);
        const context = new Context(record, undefined, this.collector);
        const response = record.render(format, context);
        return {
            ...response,
            logs: this.collector.collect(context),
        };
    }

    @Post('serialize/:namespace/:raw')
    @ApiOperation({
        summary: '序列化条目',
        description: '使用此 API 在不修改数据库的情况下将条目序列化为 MarkDown 表格行',
    })
    @ApiProduces('text/plain')
    @ApiOkResponse({
        content: {
            'text/plain': {
                schema: {
                    type: 'string',
                    pattern: String.raw`^\| (?<raw>.+) \| (?<name>.+) \| (?<intro>.+) \| (?<links>.+) \|$`,
                    example:
                        '| ruri gokou | 五更琉璃（黑猫） | ![黑猫](https://ehgt.org/1b/04/1b04021da892517c44f0729afb44168bd32c1c90-1985827-2521-3600-jpg_l.jpg)<br>网名黑猫。SNS社群“宅女集合”的成员之一，桐乃在线下会认识的宅友。有在进行同人社团活动，并开设了个人博客，宅的程度不在桐乃之下。 | [萌娘百科](https://zh.moegirl.org.cn/zh-hans/五更琉璃) [Fandom](https://oreimo.fandom.com/zh/wiki/五更琉璃) |',
                },
            },
        },
    })
    @HttpCode(HttpStatus.OK)
    serialize(@Param() p: TagParams, @Body() tag: LooseTagDto): string {
        const record = new TagRecord(tag, this.db.data.data[p.namespace]);
        return record.stringify(new Context(record, RawTag(p.raw)));
    }

    @Post('parse/:namespace')
    @ApiOperation({ summary: '解析 MarkDown 条目', description: '使用此 API 解析数据库中的 MarkDown 表格行' })
    @ApiBody({
        schema: {
            type: 'string',
            pattern: String.raw`^\| (?<raw>.+) \| (?<name>.+) \| (?<intro>.+) \| (?<links>.+) \|$`,
            example:
                '| ruri gokou | 五更琉璃（黑猫） | ![黑猫](https://ehgt.org/1b/04/1b04021da892517c44f0729afb44168bd32c1c90-1985827-2521-3600-jpg_l.jpg)<br>网名黑猫。SNS社群“宅女集合”的成员之一，桐乃在线下会认识的宅友。有在进行同人社团活动，并开设了个人博客，宅的程度不在桐乃之下。 | [萌娘百科](https://zh.moegirl.org.cn/zh-hans/五更琉璃) [Fandom](https://oreimo.fandom.com/zh/wiki/五更琉璃) |',
        },
    })
    @ApiConsumes('text/plain')
    @HttpCode(HttpStatus.OK)
    @ApiOkResponse({ type: ParsedLine })
    parse(@Param() p: TagNsParams, @Body() line: string, @Format() format: TagType): ParsedLine {
        if (line.includes('\n')) throw new BadRequestException('Parse one line at once');
        line = line.trim();
        const parsed = TagRecord.parse(line, this.db.data.data[p.namespace]);
        if (!parsed) throw new BadRequestException('Invalid markdown table row');
        const context = new Context(parsed[1], parsed[0], this.collector);
        const response = parsed[1].render(format, context);
        return {
            raw: parsed[0],
            ...response,
            logs: this.collector.collect(context),
        };
    }
}
