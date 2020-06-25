import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
/**
 * 启动服务
 */
async function bootstrap(): Promise<void> {
    const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter(), {});
    app.enableCors({
        origin: /./,
        credentials: true,
        maxAge: 600,
    });
    const options = new DocumentBuilder()
        .setTitle('Eh Tag Translation Server')
        .setDescription('连接到 EhTagTranslation 数据库的 RESTful API。')
        .setVersion('1.0')
        .addTag('Database', 'EhTagTranslation 数据库内容的增改删查。')
        .addTag('Tools', '不直接操作数据库的帮助工具。')
        .build();
    const document = SwaggerModule.createDocument(app, options);
    SwaggerModule.setup('api', app, document);
    await app.listen(3000, '0.0.0.0');
}
bootstrap().catch((err) => console.error(err));
