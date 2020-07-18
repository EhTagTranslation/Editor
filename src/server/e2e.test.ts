import { Test, TestingModule } from '@nestjs/testing';
import supertest from 'supertest';
import { AppModule } from './app/app.module';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import fastify from 'fastify';
import { setupSwagger, enableCors } from './setup';

jest.setTimeout(30_000);

describe('AppController (e2e)', () => {
    let app: NestFastifyApplication;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication<NestFastifyApplication>(new FastifyAdapter());
        enableCors(app);
        setupSwagger(app);
        await app.init();
        const adapter = app.getHttpAdapter() as FastifyAdapter;
        await adapter.getInstance<fastify.FastifyInstance>().ready();
    });

    it('/database (HEAD)', async () => {
        const res = await supertest(app.getHttpServer())
            .head('/database')
            .expect(204)
            .expect((res) => expect(res.header).toHaveProperty('etag'))
            .expect((undefined as unknown) as string);
    });

    it('/database (GET)', async () => {
        const res = await supertest(app.getHttpServer())
            .get('/database')
            .expect(200)
            .expect((res) => expect(res.header).toHaveProperty('etag'));
        expect(res.body).toMatchShapeOf({
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

    it('/database/rows (GET)', async () => {
        const res = await supertest(app.getHttpServer())
            .get('/database/rows')
            .expect(200)
            .expect((res) => expect(res.header).toHaveProperty('etag'));
        expect(res.body).toMatchShapeOf({
            namespace: 'rows',
            frontMatters: { name: '内容索引', description: '标签列表的行名，即标签的命名空间。', key: 'rows' },
            count: 9,
        });
    });

    it('/database/rows/female?format=text.json (GET)', async () => {
        const res = await supertest(app.getHttpServer())
            .get('/database/rows/female?format=text.json')
            .expect(200)
            .expect((res) => expect(res.header).toHaveProperty('etag'));
        expect(res.body).toMatchShapeOf({
            name: '女性',
            intro: '女性角色相关的恋物标签。',
            links: '数据库页面',
        });
    });

    it('/database/rows/female (GET) accept: application/raw+json', async () => {
        const res = await supertest(app.getHttpServer())
            .get('/database/rows/female')
            .set('accept', 'application/raw+json')
            .expect(200)
            .expect((res) => expect(res.header).toHaveProperty('etag'));
        expect(res.body).toMatchShapeOf({
            name: '女性',
            intro: '女性角色相关的恋物标签。',
            links: '[数据库页面](https://github.com/EhTagTranslation/Database/blob/master/database/female.md)',
        });
    });

    it('/database/rows/female (GET)', async () => {
        const res = await supertest(app.getHttpServer())
            .get('/database/rows/female')
            .expect(200)
            .expect((res) => expect(res.header).toHaveProperty('etag'));

        expect(res.body).toMatchShapeOf({
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
