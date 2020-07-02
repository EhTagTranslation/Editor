import {
    Controller,
    UseInterceptors,
    Get,
    NotFoundException,
    Head,
    Param,
    HttpCode,
    HttpStatus,
    Post,
    ConflictException,
    Body,
    Put,
    Delete,
    Query,
    BadRequestException,
    Headers,
} from '@nestjs/common';
import { InjectableBase } from 'server/injectable-base';
import { DatabaseService } from './database.service';
import { EtagInterceptor } from 'server/etag.interceptor';
import { NamespaceInfo, TagType } from 'shared/interfaces/ehtag';
import {
    ApiTags,
    ApiOperation,
    ApiNotFoundResponse,
    ApiNoContentResponse,
    ApiConflictResponse,
    ApiExcludeEndpoint,
} from '@nestjs/swagger';
import { RepoInfoDto, TagDto, TagResponseDto, LooseTagDto } from 'server/dtos/repo-info.dto';
import { NsParams, TagParams, PostTagQuery, PushEvent } from './params.dto';
import { Format } from 'server/decorators/format.decorator';
import { UserInfo } from 'server/octokit/octokit.service';
import { User } from 'server/decorators/user.decorator';
import { ApiIfMatchHeader, ApiIfNoneMatchHeader } from 'server/decorators/swagger.decoretor';
import { RawTag } from 'shared/validate';

@Controller('database')
@ApiTags('Database')
@UseInterceptors(EtagInterceptor)
export class DatabaseController extends InjectableBase {
    constructor(private readonly service: DatabaseService) {
        super();
    }

    @Get()
    @ApiOperation({ summary: '查询数据库基本情况' })
    @ApiIfNoneMatchHeader()
    getInfo(): Promise<RepoInfoDto> {
        return this.service.data.info();
    }

    @Head()
    @ApiOperation({
        summary: '查询数据库数据版本',
        description: '如只需获取 `ETag` 信息（即最新一次提交的 sha1），可以使用 `HEAD` 请求。',
    })
    @ApiIfNoneMatchHeader()
    @HttpCode(HttpStatus.NO_CONTENT)
    headInfo(): void {
        return;
    }

    @Get(':namespace')
    @ApiOperation({ summary: '查询某一分类的信息' })
    @ApiIfNoneMatchHeader()
    getNs(@Param() p: NsParams): NamespaceInfo {
        return this.service.data.data[p.namespace].info();
    }

    @Head(':namespace/:raw')
    @ApiOperation({ summary: '查询某一条目是否存在' })
    @ApiIfNoneMatchHeader()
    @ApiNoContentResponse({ description: '条目存在' })
    @ApiNotFoundResponse({ description: '条目不存在' })
    @HttpCode(HttpStatus.NO_CONTENT)
    headTag(@Param() p: TagParams): void {
        const dic = this.service.data.data[p.namespace];
        if (!dic.has(p.raw)) throw new NotFoundException();
        return;
    }

    @Get(':namespace/:raw')
    @ApiOperation({ summary: '查询某一条目的翻译' })
    @ApiIfNoneMatchHeader()
    @ApiNotFoundResponse({ description: '条目不存在' })
    getTag(@Param() p: TagParams, @Format() format: TagType): TagResponseDto {
        const dic = this.service.data.data[p.namespace];
        const rec = dic.get(p.raw);
        if (!rec) throw new NotFoundException();
        return rec.render(format, {
            database: this.service.data,
            namespace: dic,
            raw: p.raw,
        });
    }

    @Post(':namespace/:raw')
    @ApiOperation({ summary: '增加条目' })
    @ApiIfMatchHeader()
    @ApiConflictResponse({ description: '已有同名条目，需改用 `PUT` 请求' })
    async postTag(
        @Param() p: TagParams,
        @Format() format: TagType,
        @Query() q: PostTagQuery,
        @Body() tag: TagDto,
        @User() user: UserInfo,
    ): Promise<TagResponseDto> {
        const dic = this.service.data.data[p.namespace];
        if (dic.has(p.raw)) throw new ConflictException();
        if (q.before && q.after) throw new BadRequestException('Before and after cannot be applied at the same time.');
        if (q.before && !dic.has(q.before)) throw new BadRequestException(`Before tag '${q.before}' not found.`);
        if (q.after && !dic.has(q.after)) throw new BadRequestException(`Before tag '${q.after}' not found.`);
        const rec = q.before
            ? dic.add(p.raw, tag, 'before', q.before)
            : q.after
            ? dic.add(p.raw, tag, 'after', q.after)
            : dic.add(p.raw, tag);
        await this.service.commitAndPush(p.namespace, user, {
            nk: p.raw,
            nv: rec,
        });
        return rec.render(format, {
            database: this.service.data,
            namespace: dic,
            raw: p.raw,
        });
    }

    @Post(':namespace/~comment')
    @ApiOperation({ summary: '插入注释行' })
    @ApiIfMatchHeader()
    async postComment(
        @Param() p: NsParams,
        @Format() format: TagType,
        @Query() q: PostTagQuery,
        @Body() tag: LooseTagDto,
        @User() user: UserInfo,
    ): Promise<TagResponseDto> {
        const dic = this.service.data.data[p.namespace];
        if (q.before && q.after) throw new BadRequestException('Before and after cannot be applied at the same time.');
        if (q.before && !dic.has(q.before)) throw new BadRequestException(`Before tag '${q.before}' not found.`);
        if (q.after && !dic.has(q.after)) throw new BadRequestException(`Before tag '${q.after}' not found.`);
        if (!q.before && !q.after) throw new BadRequestException('Must set before or after for comment line.');
        const rec = q.before
            ? dic.add(undefined, tag, 'before', q.before)
            : q.after
            ? dic.add(undefined, tag, 'after', q.after)
            : dic.add(undefined, tag);
        await this.service.commitAndPush(p.namespace, user, {
            nv: rec,
        });
        return rec.render(format, {
            database: this.service.data,
            namespace: dic,
            raw: '~comment' as RawTag,
        });
    }

    @Put(':namespace/:raw')
    @ApiOperation({ summary: '修改条目' })
    @ApiIfMatchHeader()
    @ApiNotFoundResponse({ description: '条目不存在，需改用 `POST` 请求' })
    @ApiNoContentResponse({ description: '请求内容与数据库内容一致，未进行修改' })
    async putTag(
        @Param() p: TagParams,
        @Format() format: TagType,
        @Body() tag: TagDto,
        @User() user: UserInfo,
    ): Promise<TagResponseDto | null> {
        const dic = this.service.data.data[p.namespace];
        const oldRec = dic.get(p.raw);
        if (!oldRec) throw new NotFoundException();
        const context = {
            database: this.service.data,
            namespace: dic,
            raw: p.raw,
        };
        const oldRaw = oldRec.render('raw', context);
        if (oldRaw.name === tag.name && oldRaw.intro === tag.intro && oldRaw.links === tag.links) {
            return null;
        }
        const rec = dic.set(p.raw, tag);
        await this.service.commitAndPush(p.namespace, user, {
            ok: p.raw,
            ov: oldRec,
            nk: p.raw,
            nv: rec,
        });
        return rec.render(format, {
            database: this.service.data,
            namespace: dic,
            raw: p.raw,
        });
    }

    @Delete(':namespace/:raw')
    @ApiOperation({ summary: '删除条目' })
    @ApiIfMatchHeader()
    @ApiNotFoundResponse({ description: '条目不存在' })
    @HttpCode(HttpStatus.NO_CONTENT)
    async deleteTag(@Param() p: TagParams, @User() user: UserInfo): Promise<void> {
        const dic = this.service.data.data[p.namespace];
        const rec = dic.get(p.raw);
        if (!dic.delete(p.raw)) throw new NotFoundException();
        await this.service.commitAndPush(p.namespace, user, {
            ok: p.raw,
            ov: rec,
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
