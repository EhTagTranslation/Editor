import { Test } from '@nestjs/testing';
import supertest from 'supertest';
import { AppModule } from './app/app.module';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import type * as fastify from 'fastify';
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
        const adapter = app.getHttpAdapter() as unknown as FastifyAdapter;
        await adapter.getInstance<fastify.FastifyInstance>().ready();
    });

    afterAll(async () => {
        await app.close();
    });

    it('HEAD /database', async () => {
        const _ = await supertest(app.getHttpServer())
            .head('/database')
            .expect(HttpStatus.OK)
            .expect((res) => expect(res.header).toHaveProperty('etag'))
            .expect(undefined as unknown as string);
    }, 3000);

    it('HEAD /database ETag: [ETag]', async () => {
        const _ = await supertest(app.getHttpServer())
            .head('/database')
            .expect(HttpStatus.OK)
            .expect((res) => expect(res.header).toHaveProperty('etag'))
            .expect(undefined as unknown as string);
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
                    '添加 character:yamiyono moruru - 暗夜乃莫露露\n| 原始标签 | 名称 | 描述 | 外部链接 |\n| -------- | ---- | ---- | -------- |\n| yamiyono moruru | 暗夜乃莫露露 | 5000岁的恶魔幼女，曾经吸人血为生。最近只和可乐和拉面一起生活。<br>すもも幼儿园成员。 おはがぉー🍜ψ\\`( ･-･× )´↝<br>于2019年6月24日毕业 | [萌娘百科](https://zh.moegirl.org.cn/暗夜乃莫露露) |',
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
            .expect(undefined as unknown as string);
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
                html: '<p><a href="https://github.com/EhTagTranslation/Database/blob/master/database/female.md">数据库页面</a></p>',
                //  ast: [],
            },
        });
    });

    it('GET /database/~badge', async () => {
        const _ = await supertest(app.getHttpServer())
            .get('/database/~badge')
            .set('accept', 'application/raw+json')
            .expect(HttpStatus.OK);
        expect(_.body).toMatchShapeOf({
            schemaVersion: 1,
            label: 'database',
            message: 'c141fb41',
            isError: false,
        });
    });

    it('GET /database/all/~badge', async () => {
        const _ = await supertest(app.getHttpServer())
            .get('/database/all/~badge')
            .set('accept', 'application/raw+json')
            .expect(HttpStatus.OK);
        expect(_.body).toMatchShapeOf({
            schemaVersion: 1,
            label: 'all records',
            message: '9883',
            isError: false,
        });
    });

    it('GET /database/female/~badge', async () => {
        const _ = await supertest(app.getHttpServer())
            .get('/database/female/~badge')
            .set('accept', 'application/raw+json')
            .expect(HttpStatus.OK);
        expect(_.body).toMatchShapeOf({
            schemaVersion: 1,
            label: 'female',
            message: '523',
            isError: false,
        });
    });

    it('GET /auth/:token', async () => {
        const _ = await supertest(app.getHttpServer())
            .get('/auth/token')
            .set('accept', 'application/raw+json')
            .expect(HttpStatus.BAD_REQUEST);
    });

    it('GET /tools/parse raw+json', async () => {
        const _ = await supertest(app.getHttpServer())
            .post('/tools/parse')
            .type('text/plain')
            .send(
                `a | http://a.com [link](http://a.com "name") [link2]( http://a.com ) *test1* __test2__ \`\`\`x\`xx\`  \`\`\` a! | ![](https://exhentai.org/t/56/ab/56abfaf1c30726478ded049645d3b074891315be-933888-4140-6070-jpg_l.jpg) ![图](http://xx.com "aaa") ![图2]( http://xx.com) | https://zh.moegirl.org.cn/%E5%AF%86%E6%B6%85%E7%93%A6(%E5%85%AC%E4%B8%BB%E8%BF%9E%E7%BB%93)`,
            )
            .set('accept', 'application/raw+json')
            .expect(HttpStatus.OK);
        expect(_.body).toEqual({
            key: 'a',
            value: {
                name: '[http://a.com](http://a.com) [link](http://a.com "name") [link2](http://a.com) *test1* **test2** ``x`xx` `` a!',
                intro: '![](# "https://ehgt.org/56/ab/56abfaf1c30726478ded049645d3b074891315be-933888-4140-6070-jpg_l.jpg") ![图](http://xx.com "aaa") ![图2](http://xx.com)',
                links: '[萌娘百科](https://zh.moegirl.org.cn/密涅瓦%28公主连结%29)',
            },
        });
    });

    it('GET /tools/parse html+json', async () => {
        const _ = await supertest(app.getHttpServer())
            .post('/tools/parse')
            .type('text/plain')
            .send(
                `a | http://a.com [link](http://a.com "name") [link2]( http://a.com ) *test1* __test2__ \`\`\`x\`xx\`  \`\`\` a! | ![](https://exhentai.org/t/56/ab/56abfaf1c30726478ded049645d3b074891315be-933888-4140-6070-jpg_l.jpg) ![图](http://xx.com "aaa") ![图2]( http://xx.com) | https://zh.moegirl.org.cn/%E5%AF%86%E6%B6%85%E7%93%A6(%E5%85%AC%E4%B8%BB%E8%BF%9E%E7%BB%93)`,
            )
            .set('accept', 'application/html+json')
            .expect(HttpStatus.OK);
        expect(_.body).toEqual({
            key: 'a',
            value: {
                name: '<p><a href="http://a.com">http://a.com</a> <a href="http://a.com" title="name">link</a> <a href="http://a.com">link2</a> <em>test1</em> <strong>test2</strong> <abbr>x`xx`</abbr> a!</p>',
                intro: '<p><img src="https://ehgt.org/56/ab/56abfaf1c30726478ded049645d3b074891315be-933888-4140-6070-jpg_l.jpg" nsfw="R18"> <img src="http://xx.com" title="aaa" alt="图"> <img src="http://xx.com" alt="图2"></p>',
                links: '<p><a href="https://zh.moegirl.org.cn/密涅瓦%28公主连结%29">萌娘百科</a></p>',
            },
        });
    });

    it('GET /tools/parse text.json', async () => {
        const _ = await supertest(app.getHttpServer())
            .post('/tools/parse')
            .type('text/plain')
            .send(
                `a | http://a.com [link](http://a.com "name") [link2]( http://a.com ) *test1* __test2__ \`\`\`x\`xx\`  \`\`\` a! | ![](https://exhentai.org/t/56/ab/56abfaf1c30726478ded049645d3b074891315be-933888-4140-6070-jpg_l.jpg) ![图](http://xx.com "aaa") ![图2]( http://xx.com) | https://zh.moegirl.org.cn/%E5%AF%86%E6%B6%85%E7%93%A6(%E5%85%AC%E4%B8%BB%E8%BF%9E%E7%BB%93)`,
            )
            .query({ format: 'text.json' })
            .expect(HttpStatus.OK);
        expect(_.body).toEqual({
            key: 'a',
            value: {
                name: 'http://a.com link link2 test1 test2 x`xx` a!',
                intro: '',
                links: '萌娘百科',
            },
        });
    });
});
