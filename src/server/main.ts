import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FastifyAdapter, type NestFastifyApplication } from '@nestjs/platform-fastify';
import { AppModule } from './app/app.module.js';
import { setupSwagger, enableCors } from './setup.js';

const logger = new Logger('Main', { timestamp: true });
/**
 * 启动服务
 */
async function bootstrap(): Promise<void> {
    logger.log(`App starting`);

    const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter(), {});
    enableCors(app);
    setupSwagger(app);

    const config = app.get(ConfigService);
    const port = Number.parseInt(config.get<string>('PORT', '3000'));
    await app.listen(port, '0.0.0.0');
    const url = await app.getUrl();
    Logger.log(`App start listening on ${url}`, 'Main');
}

bootstrap().catch((err: unknown) => logger.error(err));
