import { Test } from '@nestjs/testing';
import supertest from 'supertest';
import { AppModule } from './app/app.module';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import * as fastify from 'fastify';
import { setupSwagger, enableCors } from './setup';
import { HttpStatus } from '@nestjs/common';

jest.setTimeout(30_000);

describe('AppController (e2e)', () => {
    let app: NestFastifyApplication;

    beforeAll(async () => {
        const moduleFixture = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication<NestFastifyApplication>(new FastifyAdapter(), {});
        enableCors(app);
        setupSwagger(app);
        await app.init();
        const adapter = (app.getHttpAdapter() as unknown) as FastifyAdapter;
        console.log(adapter);
        await adapter.getInstance<fastify.FastifyInstance>().ready();
    });

    it('HEAD /database', async () => {
        const _ = await supertest(app.getHttpServer())
            .head('/database')
            .expect(HttpStatus.OK)
            .expect((res) => expect(res.header).toHaveProperty('etag'))
            .expect((undefined as unknown) as string);
    });

    it('HEAD /database ETag: [ETag]', async () => {
        const _ = await supertest(app.getHttpServer())
            .head('/database')
            .expect(HttpStatus.OK)
            .expect((res) => expect(res.header).toHaveProperty('etag'))
            .expect((undefined as unknown) as string);
        const _2 = await supertest(app.getHttpServer())
            .head('/database')
            .set('If-None-Match', (_.header as Record<string, string>).etag)
            .expect(HttpStatus.NOT_MODIFIED);
    });

    it('GET /database', async () => {
        const _ = await supertest(app.getHttpServer())
            .get('/database')
            .expect(HttpStatus.OK)
            .expect((res) => expect(res.header).toHaveProperty('etag'));
        expect(_.body).toMatchShapeOf({
            repo: 'https://github.com/EhTagTranslation/Database.git',
            head: {
                message:
                    '添加 character:yamiyono moruru - 暗夜乃莫露露\n| 原始标签 | 名称 | 描述 | 外部链接 |\n| -------- | ---- | ---- | -------- |\n| yamiyono moruru | 暗夜乃莫露露 | 5000岁的恶魔幼女，曾经吸人血为生。最近只和可乐和拉面一起生活。<br>すもも幼儿园成员。 おはがぉー🍜ψ\\`( ･-･× )´↝<br>于2019年6月24日毕业 | [萌娘百科](https://zh.moegirl.org/暗夜乃莫露露) |',
                sha: '3255feee264a0d44caca85a305b114e9a2cc89fe',
                author: {
                    name: 'dawn-lc',
                    email: '30336566+dawn-lc@users.noreply.github.com',
                    when: '2020-07-18T08:44:54.000Z',
                },
                committer: {
                    name: 'ehtagtranslation[bot]',
                    email: '66814738+ehtagtranslation[bot]@users.noreply.github.com',
                    when: '2020-07-18T08:44:54.000Z',
                },
            },
            version: 5,
            data: [
                {
                    namespace: 'rows',
                    frontMatters: {
                        name: '内容索引',
                        description: '标签列表的行名，即标签的命名空间。',
                        key: 'rows',
                    },
                    count: 9,
                },
            ],
        });
    });

    it('GET /database/rows', async () => {
        const _ = await supertest(app.getHttpServer())
            .get('/database/rows')
            .expect(HttpStatus.OK)
            .expect((res) => expect(res.header).toHaveProperty('etag'));
        expect(_.body).toMatchShapeOf({
            namespace: 'rows',
            frontMatters: { name: '内容索引', description: '标签列表的行名，即标签的命名空间。', key: 'rows' },
            count: 9,
        });
    });

    it('HEAD /database/rows/female', async () => {
        const _ = await supertest(app.getHttpServer())
            .head('/database/rows/female')
            .expect(HttpStatus.OK)
            .expect((res) => expect(res.header).toHaveProperty('etag'))
            .expect((undefined as unknown) as string);
    });

    it('GET /database/rows/female?format=text.json', async () => {
        const _ = await supertest(app.getHttpServer())
            .get('/database/rows/female?format=text.json')
            .expect(HttpStatus.OK)
            .expect('vary', 'Origin, Accept, Accept-Encoding')
            .expect((res) => expect(res.header).toHaveProperty('etag'));
        expect(_.body).toMatchShapeOf({
            name: '女性',
            intro: '女性角色相关的恋物标签。',
            links: '数据库页面',
        });
    });

    it('GET /database/rows/female Accept: application/raw+json', async () => {
        const _ = await supertest(app.getHttpServer())
            .get('/database/rows/female')
            .set('accept', 'application/raw+json')
            .expect(HttpStatus.OK)
            .expect('vary', 'Origin, Accept, Accept-Encoding')
            .expect((res) => expect(res.header).toHaveProperty('etag'));
        expect(_.body).toMatchShapeOf({
            name: '女性',
            intro: '女性角色相关的恋物标签。',
            links: '[数据库页面](https://github.com/EhTagTranslation/Database/blob/master/database/female.md)',
        });
    });

    it('GET /database/rows/female', async () => {
        const _ = await supertest(app.getHttpServer())
            .get('/database/rows/female')
            .expect(HttpStatus.OK)
            .expect('vary', 'Origin, Accept, Accept-Encoding')
            .expect((res) => expect(res.header).toHaveProperty('etag'));

        expect(_.body).toMatchShapeOf({
            name: {
                raw: '女性',
                text: '女性',
                html: '<p>女性</p>',
                // ast: [],
            },
            intro: {
                raw: '女性角色相关的恋物标签。',
                text: '女性角色相关的恋物标签。',
                html: '<p>女性角色相关的恋物标签。</p>',
                // ast: [],
            },
            links: {
                raw: '[数据库页面](https://github.com/EhTagTranslation/Database/blob/master/database/female.md)',
                text: '数据库页面',
                html:
                    '<p><a href="https://github.com/EhTagTranslation/Database/blob/master/database/female.md">数据库页面</a></p>',
                //  ast: [],
            },
        });
    });

    afterAll(async () => {
        await app.close();
    });
});
