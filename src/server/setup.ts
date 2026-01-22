import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import type { INestApplication } from '@nestjs/common';
import type { FastifyReply, FastifyRequest } from 'fastify';

export function setupSwagger(app: INestApplication): void {
    const adapter = app.getHttpAdapter();
    adapter.get('/', (req: FastifyRequest, res: FastifyReply) => {
        void res.redirect('/swagger', 302);
    });

    const config = new DocumentBuilder()
        .setTitle('Eh Tag Translation Server')
        .addBearerAuth(undefined, 'GitHub-Token')
        .setDescription('连接到 EhTagTranslation 数据库的 RESTful API。')
        .setVersion('1.0')
        .addTag('Database', 'EhTagTranslation 数据库内容的增改删查。')
        .addTag('Tools', '不直接操作数据库的帮助工具。')
        .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('/swagger', app, document, {
        customCssUrl: [`https://unpkg.com/swagger-ui-dist@5/swagger-ui.css`],
        customJs: [
            `https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js`,
            `https://unpkg.com/swagger-ui-dist@5/swagger-ui-standalone-preset.js`,
        ],
    });
}

export function enableCors(app: INestApplication): void {
    app.enableCors({
        origin: (requestOrigin: string | undefined, callback: (err: Error | null, origin: string | null) => void) => {
            requestOrigin = requestOrigin?.trim();
            if (!requestOrigin || requestOrigin === 'null') {
                callback(null, '*');
            } else {
                callback(null, requestOrigin);
            }
        },
        credentials: false,
        methods: ['OPTIONS', 'HEAD', 'GET', 'PUT', 'POST', 'DELETE'],
        allowedHeaders: ['If-Match', 'If-None-Match', 'Content-Type', 'Authorization'],
        exposedHeaders: ['ETag', 'Location'],
        maxAge: 60 * 60 * 24,
    });
}
