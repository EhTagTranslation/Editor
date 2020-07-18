import './init';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { AppModule } from './app/app.module';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { setupSwagger, enableCors } from './setup';

const logger = new Logger('Main', true);
/**
 * 启动服务
 */
async function bootstrap(): Promise<void> {
    logger.log(`App starting`);

    const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter(), {});
    enableCors(app);
    setupSwagger(app);

    const port = Number.parseInt(app.get(ConfigService).get('PORT', '3000'));
    await app.listen(port, '0.0.0.0');
    const url = await app.getUrl();
    Logger.log(`App start listening on ${url}`, 'Main');
}

bootstrap().catch((err: unknown) => logger.error(err));
