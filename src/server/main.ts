import 'source-map-support/register';
import { Promise } from 'bluebird';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import compress from 'fastify-compress';

Object.defineProperty(globalThis, 'Promise', { value: Promise, writable: false, enumerable: true });
const logger = new Logger('Main', true);

/**
 * 启动服务
 */
async function bootstrap(): Promise<void> {
    logger.log(`App starting`);
    const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter(), {});
    app.register(compress, { encodings: ['gzip', 'deflate'] });
    app.enableCors({
        origin: true,
        credentials: false,
        methods: ['OPTIONS', 'HEAD', 'GET', 'PUT', 'POST', 'DELETE'],
        allowedHeaders: ['If-Match', 'If-None-Match', 'Content-Type', 'Authorization'],
        exposedHeaders: ['ETag', 'Location'],
        maxAge: 60 * 60 * 24,
    });
    const options = new DocumentBuilder()
        .setTitle('Eh Tag Translation Server')
        .addBearerAuth(undefined, 'GitHub Token')
        .setDescription('连接到 EhTagTranslation 数据库的 RESTful API。')
        .setVersion('1.0')
        .addTag('Database', 'EhTagTranslation 数据库内容的增改删查。')
        .addTag('Tools', '不直接操作数据库的帮助工具。')
        .build();
    const document = SwaggerModule.createDocument(app, options);
    SwaggerModule.setup('/', app, document);

    const port = Number.parseInt(app.get(ConfigService).get('PORT', '3000'));
    await app.listen(port, '0.0.0.0');
    const url = await app.getUrl();
    Logger.log(`App start listening on ${url}`, 'Main');
}

bootstrap().catch((err: unknown) => logger.error(err));
