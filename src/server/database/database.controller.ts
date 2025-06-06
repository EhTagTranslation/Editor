import {
    Controller,
    UseInterceptors,
    Get,
    NotFoundException,
    Head,
    Param,
    HttpStatus,
    Post,
    ConflictException,
    Body,
    Put,
    Delete,
    Query,
    BadRequestException,
    Headers,
    HttpException,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiNotFoundResponse,
    ApiNoContentResponse,
    ApiConflictResponse,
    ApiExcludeEndpoint,
    ApiOkResponse,
    ApiCreatedResponse,
} from '@nestjs/swagger';
import type { NamespaceDatabase } from '#shared/namespace-database';
import type { Tag, TagType } from '#shared/interfaces/ehtag';
import type { RawTag } from '#shared/raw-tag';
import { TagRecord } from '#shared/tag-record';
import { Context } from '#shared/markdown/index';
import { InjectableBase } from '../injectable-base.js';
import { ApiIfMatchHeader, ApiIfNoneMatchHeader } from '../decorators/swagger.decoretor.js';
import { EtagInterceptor } from '../app/etag.interceptor.js';
import { RepoInfoDto, TagDto, TagResponseDto, LooseTagDto, NamespaceInfoDto } from '../dtos/repo-info.dto.js';
import { Format } from '../decorators/format.decorator.js';
import type { UserInfo } from '../octokit/octokit.service.js';
import { User } from '../decorators/user.decorator.js';
import { LoggerCollector } from '../utils/context-logger.js';
import { DatabaseService } from './database.service.js';
import { NsParams, TagParams, PostTagQuery, type PushEvent } from './params.dto.js';

@Controller('database')
@ApiTags('Database')
@UseInterceptors(EtagInterceptor)
export class DatabaseController extends InjectableBase {
    constructor(private readonly service: DatabaseService) {
        super();
    }
    private readonly collector = new LoggerCollector();

    private prepareTag(
        dic: NamespaceDatabase,
        raw: RawTag | undefined,
        tag: Tag<'raw'>,
        format: TagType,
    ): [TagRecord, TagResponseDto] {
        const record = new TagRecord(tag, dic);
        const context = new Context(record, raw, this.collector);
        const response = record.render(format, context);
        const logs = this.collector.collect(context);
        if (logs.length > 0) {
            throw new BadRequestException(logs.map((log) => `${log.logger}: ${log.message}`).join('\n'));
        }
        return [record, response];
    }

    @Head()
    @ApiOperation({
        summary: '查询数据库数据版本',
        description: '如只需获取 `ETag` 信息（即最新一次提交的 sha1），可以使用 `HEAD` 请求。',
    })
    @ApiIfNoneMatchHeader()
    @ApiNoContentResponse({ description: '数据库数据版本从 `ETag` 返回' })
    headInfo(): void {
        return;
    }

    @Get()
    @ApiOperation({ summary: '查询数据库基本情况' })
    @ApiIfNoneMatchHeader()
    @ApiOkResponse({ type: RepoInfoDto })
    async getInfo(): Promise<RepoInfoDto> {
        return this.service.data.info();
    }

    @Get(':namespace')
    @ApiOperation({ summary: '查询某一分类的信息' })
    @ApiIfNoneMatchHeader()
    @ApiOkResponse({ type: NamespaceInfoDto })
    getNs(@Param() p: NsParams): NamespaceInfoDto {
        return this.service.data.data[p.namespace].info();
    }

    @Head(':namespace/:raw')
    @ApiOperation({ summary: '查询某一条目是否存在' })
    @ApiIfNoneMatchHeader()
    @ApiNoContentResponse({ description: '条目存在' })
    @ApiNotFoundResponse({ description: '条目不存在' })
    headTag(@Param() p: TagParams): void {
        const dic = this.service.data.data[p.namespace];
        if (!dic.has(p.raw)) throw new NotFoundException();
    }

    @Get(':namespace/:raw')
    @ApiOperation({ summary: '查询某一条目的翻译' })
    @ApiIfNoneMatchHeader()
    @ApiNotFoundResponse({ description: '条目不存在' })
    @ApiOkResponse({ type: TagResponseDto })
    getTag(@Param() p: TagParams, @Format() format: TagType): TagResponseDto {
        const dic = this.service.data.data[p.namespace];
        const rec = dic.get(p.raw);
        if (!rec) throw new NotFoundException();
        return rec.render(format, new Context(rec, p.raw));
    }

    @Post(':namespace/:raw')
    @ApiOperation({ summary: '增加条目' })
    @ApiIfMatchHeader()
    @ApiConflictResponse({ description: '已有同名条目，需改用 `PUT` 请求' })
    @ApiCreatedResponse({ type: TagResponseDto })
    async postTag(
        @Param() p: TagParams,
        @Format() format: TagType,
        @Query() q: PostTagQuery,
        @Body() tag: TagDto,
        @User() user: UserInfo,
    ): Promise<TagResponseDto> {
        let ret: TagResponseDto | undefined;
        await this.service.apply(user, p.namespace, (dic) => {
            if (dic.has(p.raw)) throw new ConflictException();
            if (q.before && q.after)
                throw new BadRequestException('Before and after cannot be applied at the same time.');
            if (q.before && !dic.has(q.before)) throw new BadRequestException(`Before tag '${q.before}' not found.`);
            if (q.after && !dic.has(q.after)) throw new BadRequestException(`Before tag '${q.after}' not found.`);

            let rec;
            [rec, ret] = this.prepareTag(dic, p.raw, tag, format);

            if (q.before) dic.add(p.raw, rec, 'before', q.before);
            else if (q.after) dic.add(p.raw, rec, 'after', q.after);
            else dic.add(p.raw, rec);

            return {
                nk: p.raw,
                nv: rec,
            };
        });
        return ret!;
    }

    @Post(':namespace/~comment')
    @ApiOperation({ summary: '插入注释行' })
    @ApiIfMatchHeader()
    @ApiCreatedResponse({ type: TagResponseDto })
    async postComment(
        @Param() p: NsParams,
        @Format() format: TagType,
        @Query() q: PostTagQuery,
        @Body() tag: LooseTagDto,
        @User() user: UserInfo,
    ): Promise<TagResponseDto> {
        let ret: TagResponseDto | undefined;
        await this.service.apply(user, p.namespace, (dic) => {
            if (q.before && q.after)
                throw new BadRequestException('Before and after cannot be applied at the same time.');
            if (q.before && !dic.has(q.before)) throw new BadRequestException(`Before tag '${q.before}' not found.`);
            if (q.after && !dic.has(q.after)) throw new BadRequestException(`Before tag '${q.after}' not found.`);
            if (!q.before && !q.after) throw new BadRequestException('Must set before or after for comment line.');

            let rec;
            [rec, ret] = this.prepareTag(dic, undefined, tag, format);

            if (q.before) dic.add(undefined, rec, 'before', q.before);
            else if (q.after) dic.add(undefined, rec, 'after', q.after);
            else dic.add(undefined, rec);

            return {
                nv: rec,
            };
        });
        return ret!;
    }

    @Put(':namespace/:raw')
    @ApiOperation({ summary: '修改条目' })
    @ApiIfMatchHeader()
    @ApiNotFoundResponse({ description: '条目不存在，需改用 `POST` 请求' })
    @ApiNoContentResponse({ description: '请求内容与数据库内容一致，未进行修改' })
    @ApiOkResponse({ type: TagResponseDto })
    async putTag(
        @Param() p: TagParams,
        @Format() format: TagType,
        @Body() tag: TagDto,
        @User() user: UserInfo,
    ): Promise<TagResponseDto> {
        let ret: TagResponseDto | undefined;
        await this.service.apply(user, p.namespace, (dic) => {
            const oldRec = dic.get(p.raw);
            if (!oldRec) throw new NotFoundException();
            let newRec;
            [newRec, ret] = this.prepareTag(dic, p.raw, tag, format);

            const context = new Context(dic, p.raw);
            const oldRaw = oldRec.render('raw', context);
            const newRaw = newRec.render('raw', context);
            if (oldRaw.name === newRaw.name && oldRaw.intro === newRaw.intro && oldRaw.links === newRaw.links) {
                throw new HttpException('请求内容与数据库内容一致，未进行修改', HttpStatus.NO_CONTENT);
            }
            dic.set(p.raw, newRec);
            return {
                ok: p.raw,
                ov: oldRec,
                nk: p.raw,
                nv: newRec,
            };
        });
        return ret!;
    }

    @Delete(':namespace/:raw')
    @ApiOperation({ summary: '删除条目' })
    @ApiIfMatchHeader()
    @ApiNotFoundResponse({ description: '条目不存在' })
    @ApiOkResponse()
    async deleteTag(@Param() p: TagParams, @User() user: UserInfo): Promise<void> {
        await this.service.apply(user, p.namespace, (dic) => {
            const rec = dic.delete(p.raw);
            if (!rec) throw new NotFoundException();
            return {
                ok: p.raw,
                ov: rec,
            };
        });
    }

    @ApiExcludeEndpoint()
    @Post('~update-webhook')
    async updateDatabase(
        @Headers('x-github-delivery') delivery: string,
        @Headers('x-github-event') event: string,
        @Body() payload: PushEvent,
    ): Promise<string> {
        if (!delivery) return 'Unknown delivery.';
        if (event === 'ping') return 'pong';
        if (event !== 'push') return 'Unsupported event.';
        if (payload.ref !== 'refs/heads/master') return 'Not master, skipped.';
        const head = await this.service.data.sha();
        if (payload.after === head) return 'Already up-to-date.';
        const start = Date.now();
        const files = await this.service.pull();
        const newHead = await this.service.data.sha();
        return `Pulled from github in ${Date.now() - start}ms, updated from ${head} to ${newHead}.

  Updated files:
    ${(files ?? []).join('\n    ')}`;
    }
}
