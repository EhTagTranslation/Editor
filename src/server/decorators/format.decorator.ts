import { createParamDecorator, BadRequestException, Header } from '@nestjs/common';
import type { FastifyRequest } from 'fastify';
import { ApiQuery, ApiProduces } from '@nestjs/swagger';
import { __decorate } from 'tslib';
import type { TagType } from '#shared/interfaces/ehtag';

function getFromQuery(format: string): TagType {
    format = format.trim().toLowerCase();
    switch (format) {
        case 'json':
        case 'full.json':
            return 'full';
        case 'raw.json':
            return 'raw';
        case 'ast.json':
            return 'ast';
        case 'html.json':
            return 'html';
        case 'text.json':
            return 'text';
        default:
            throw new BadRequestException(
                'Invalid format query, should be one of: json, raw.json, ast.json, html.json, text.json',
            );
    }
}

function getFromHeader(accept: string): TagType {
    const match = /application\/(?<type>full|html|ast|raw|text)\+json/i.exec(accept);
    if (match?.groups) return match.groups['type'].toLowerCase() as TagType;
    return 'full';
}

export const Format = createParamDecorator<unknown, TagType>(
    (_, ctx) => {
        const request = ctx.switchToHttp().getRequest<FastifyRequest>();
        const format = (request.query as Record<string, string>)['format'] as unknown;
        if (format && typeof format == 'string') return getFromQuery(format);
        const accept = request.headers.accept as unknown;
        if (accept && typeof accept == 'string') return getFromHeader(accept);
        return 'full';
    },
    [
        (target, key) => {
            __decorate(
                [
                    ApiQuery({
                        name: 'format',
                        required: false,
                        description: '响应格式，也可通过 HTTP Accept 头指定，如：Accept: application/ast+json',
                        enum: ['json', 'raw.json', 'ast.json', 'html.json', 'text.json'],
                    }),
                    ApiProduces(
                        'application/json',
                        'application/raw+json',
                        'application/ast+json',
                        'application/html+json',
                        'application/text+json',
                    ),
                    Header('Vary', 'Origin, Accept, Accept-Encoding'),
                ],
                target,
                key,
                null,
            );
        },
    ],
);
