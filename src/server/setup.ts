import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import type { INestApplication } from '@nestjs/common';

export function setupSwagger(app: INestApplication): void {
    const options = new DocumentBuilder()
        .setTitle('Eh Tag Translation Server')
        .addBearerAuth(undefined, 'GitHub-Token')
        .setDescription('连接到 EhTagTranslation 数据库的 RESTful API。')
        .setVersion('1.0')
        .addTag('Database', 'EhTagTranslation 数据库内容的增改删查。')
        .addTag('Tools', '不直接操作数据库的帮助工具。')
        .build();
    const document = SwaggerModule.createDocument(app, options);
    SwaggerModule.setup('/', app, document);
}

export function enableCors(app: INestApplication): void {
    app.enableCors({
        origin: true,
        credentials: false,
        methods: ['OPTIONS', 'HEAD', 'GET', 'PUT', 'POST', 'DELETE'],
        allowedHeaders: ['If-Match', 'If-None-Match', 'Content-Type', 'Authorization'],
        exposedHeaders: ['ETag', 'Location'],
        maxAge: 60 * 60 * 24,
    });
}
