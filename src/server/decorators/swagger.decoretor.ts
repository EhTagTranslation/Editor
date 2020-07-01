import { ApiHeader, ApiResponse } from '@nestjs/swagger';
import { __decorate } from 'tslib';
import { HttpStatus } from '@nestjs/common';

export const ApiIfNoneMatchHeader = (): MethodDecorator => (target, key, desc) => {
    __decorate(
        [
            ApiResponse({
                status: HttpStatus.NOT_MODIFIED,
                description: '`If-None-Match` 头与数据库当前版本匹配',
            }),
            ApiHeader({
                name: 'If-None-Match',
                required: false,
                description:
                    '使用 `ETag` 进行版本控制，其值为最新一次 Git commit 的 sha1 值，可以使用查询数据库数据版本 API 进行查询',
                example: '"d4553b638098466ef013567b319c034f8ee34950"',
            }),
        ],
        target,
        key,
        desc,
    );
};

export const ApiIfMatchHeader = (): MethodDecorator => (target, key, desc) => {
    __decorate(
        [
            ApiResponse({
                status: HttpStatus.PRECONDITION_FAILED,
                description: '`If-Match` 头与数据库当前版本不匹配',
            }),
            ApiResponse({
                status: 428,
                description: '未提供 `If-Match` 头',
            }),
            ApiHeader({
                name: 'If-Match',
                required: true,
                description:
                    '使用 `ETag` 进行版本控制，其值为最新一次 Git commit 的 sha1 值，可以使用查询数据库数据版本 API 进行查询',
                example: '"d4553b638098466ef013567b319c034f8ee34950"',
            }),
        ],
        target,
        key,
        desc,
    );
};
