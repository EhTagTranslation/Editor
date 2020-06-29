import { ApiHeader } from '@nestjs/swagger';

export const ApiIfMatchHeader = (): ClassDecorator & MethodDecorator =>
    ApiHeader({
        name: 'If-Match',
        required: true,
        description:
            '使用 `ETag` 进行版本控制，其值为最新一次 Git commit 的 sha1 值，可以使用查询数据库数据版本 API 进行查询',
        example: '"d4553b638098466ef013567b319c034f8ee34950"',
    }) as ClassDecorator & MethodDecorator;

export const ApiIfNoneMatchHeader = (): ClassDecorator & MethodDecorator =>
    ApiHeader({
        name: 'If-None-Match',
        required: false,
        description:
            '使用 `ETag` 进行版本控制，其值为最新一次 Git commit 的 sha1 值，可以使用查询数据库数据版本 API 进行查询',
        example: '"d4553b638098466ef013567b319c034f8ee34950"',
    }) as ClassDecorator & MethodDecorator;
