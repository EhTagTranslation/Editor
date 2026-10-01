// @ts-check
import { jest } from '@jest/globals';
import { Test } from '@nestjs/testing';
import supertest from 'supertest';
import { FastifyAdapter } from '@nestjs/platform-fastify';
import { HttpStatus } from '@nestjs/common';
import simpleGit from 'simple-git';
import { AppModule } from '#server/app/app.module';
import { DatabaseService } from '#server/database/database.service';
import { setupSwagger, enableCors, enableCompression } from '#server/setup';

jest.setTimeout(30_000);

describe('AppController (e2e)', () => {
    /** @type {import('@nestjs/platform-fastify').NestFastifyApplication} */
    let app;
    /** @type {DatabaseService} */
    let database;
    /** @type {import('type-fest').Jsonify<import('#shared/interfaces/ehtag').RepoInfo>} */
    let databaseInfo;

    beforeAll(async () => {
        const moduleFixture = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication(new FastifyAdapter(), {});
        enableCors(app);
        setupSwagger(app);
        await enableCompression(app);
        await app.init();

        const adapter = /** @type {FastifyAdapter} */ app.getHttpAdapter();
        await adapter.getInstance().ready();
        database = app.get(DatabaseService);
        const response = await supertest(app.getHttpServer()).get('/database').expect(HttpStatus.OK);
        databaseInfo = response.body;
    }, 180_000);

    afterAll(async () => {
        await app?.close();
    });

    it('HEAD /database', async () => {
        const _ = await supertest(app.getHttpServer())
            .head('/database')
            .expect(HttpStatus.OK)
            .expect((res) => expect(res.header).toHaveProperty('etag'))
            .expect(undefined);
    }, 3000);

    it('HEAD /database ETag: [ETag]', async () => {
        const _ = await supertest(app.getHttpServer())
            .head('/database')
            .expect(HttpStatus.OK)
            .expect((res) => expect(res.header).toHaveProperty('etag'))
            .expect(undefined);
        const _2 = await supertest(app.getHttpServer())
            .head('/database')
            .set('If-None-Match', _.header['etag'])
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
            version: 7,
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
            .expect(undefined);
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

    describe('GET /database/:namespace/:raw/blame', () => {
        it('returns complete line history with authors, dates and commit messages', async () => {
            const response = await supertest(app.getHttpServer())
                .get('/database/rows/female/blame')
                .expect(HttpStatus.OK)
                .expect('Content-Type', /json/)
                .expect('ETag', `"${databaseInfo.head.sha}"`);
            expect(response.body).toBeInstanceOf(Array);
            expect(response.body.length).toBeGreaterThan(0);

            // 用独立的 Git 正则行选择核对完整提交序列，而非调用服务的 blame 方法。
            const git = simpleGit(database.path);
            const history = await git.raw([
                'log',
                '--format=%H',
                '--no-patch',
                '-L/^[|][[:space:]]*female[[:space:]]*[|]/,+1:database/rows.md',
                databaseInfo.head.sha,
            ]);
            expect(response.body.map((entry) => entry.sha)).toEqual(history.trim().split('\n'));
            for (const entry of response.body) {
                expect(entry).toMatchObject({
                    sha: expect.stringMatching(/^[a-f0-9]{40}$/),
                    message: expect.any(String),
                    author: { name: expect.any(String), email: expect.any(String), when: expect.any(String) },
                    committer: { name: expect.any(String), email: expect.any(String), when: expect.any(String) },
                });
                expect(new Date(entry.author.when).toISOString()).toBe(entry.author.when);
                expect(new Date(entry.committer.when).toISOString()).toBe(entry.committer.when);
            }

            const latest = response.body[0];
            const details = await git.raw([
                'show',
                '--no-patch',
                '--format=%an%x00%ae%x00%aI%x00%cn%x00%ce%x00%cI%x00%B',
                latest.sha,
            ]);
            const [author, authorEmail, authoredAt, committer, committerEmail, committedAt, message] =
                details.split('\0');
            expect(latest).toMatchObject({
                author: { name: author, email: authorEmail, when: new Date(authoredAt).toISOString() },
                committer: { name: committer, email: committerEmail, when: new Date(committedAt).toISOString() },
            });
            expect(latest.message.trim()).toBe(message.trim());
        });

        it('returns 304 without a body for a matching ETag', async () => {
            const response = await supertest(app.getHttpServer())
                .get('/database/rows/female/blame')
                .set('If-None-Match', `"${databaseInfo.head.sha}"`)
                .expect(HttpStatus.NOT_MODIFIED);
            expect(response.text).toBe('');
        });

        it('returns history for a stale ETag', async () => {
            const response = await supertest(app.getHttpServer())
                .get('/database/rows/female/blame')
                .set('If-None-Match', `"${'0'.repeat(40)}"`)
                .expect(HttpStatus.OK);
            expect(response.body.length).toBeGreaterThan(0);
        });

        it('accepts URL-encoded tags containing spaces', async () => {
            const raw = Array.from(database.data.data.character.raw()).find(([tag]) => tag.includes(' '))?.[0];
            if (!raw) throw new Error('数据库中没有包含空格的角色标签');
            const response = await supertest(app.getHttpServer())
                .get(`/database/character/${encodeURIComponent(raw)}/blame`)
                .expect(HttpStatus.OK);
            expect(response.body.length).toBeGreaterThan(0);
        });

        it.each([
            ['/database/invalid/female/blame', 'namespace'],
            ['/database/rows/invalid%2Ftag/blame', 'raw'],
        ])('rejects invalid parameters: %s', async (url, field) => {
            const response = await supertest(app.getHttpServer()).get(url).expect(HttpStatus.BAD_REQUEST);
            expect(response.body.statusCode).toBe(HttpStatus.BAD_REQUEST);
            expect(response.body.message).toEqual(expect.arrayContaining([expect.stringContaining(field)]));
        });

        it('returns 404 for a missing tag', async () => {
            await supertest(app.getHttpServer())
                .get('/database/rows/ehtt e2e nonexistent tag/blame')
                .expect(HttpStatus.NOT_FOUND)
                .expect('ETag', `"${databaseInfo.head.sha}"`);
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

    it('GET /tools/parse/parody raw+json', async () => {
        const _ = await supertest(app.getHttpServer())
            .post('/tools/parse/parody')
            .type('text/plain')
            .send(
                `a | http://a.com [link](http://a.com "name") [link2]( http://a.com ) *test1* __test2__ \`\`\`x\`xx\`  \`\`\` a! | ![](https://s.exhentai.org/t/56/ab/56abfaf1c30726478ded049645d3b074891315be-933888-4140-6070-jpg_l.jpg) ![图](http://xx.com "aaa") ![图2]( http://xx.com) | https://zh.moegirl.org.cn/%E5%AF%86%E6%B6%85%E7%93%A6(%E5%85%AC%E4%B8%BB%E8%BF%9E%E7%BB%93)`,
            )
            .set('accept', 'application/raw+json')
            .expect(HttpStatus.OK);
        expect(_.body).toEqual({
            raw: 'a',
            name: '[http://a.com](http://a.com) [link](http://a.com "name") [link2](http://a.com) *test1* **test2** ``x`xx` `` a!',
            intro: '![](# "https://ehgt.org/56/ab/56abfaf1c30726478ded049645d3b074891315be-933888-4140-6070-jpg_l.jpg") ![图](http://xx.com "aaa") ![图2](http://xx.com)',
            links: '[萌娘百科](https://zh.moegirl.org.cn/密涅瓦%28公主连结%29)',
            logs: [
                {
                    logger: 'error',
                    message: '无效标签引用：`x`xx`` 不是一个有效的标签。',
                },
            ],
        });
    });

    it('GET /tools/parse/parody html+json', async () => {
        const _ = await supertest(app.getHttpServer())
            .post('/tools/parse/parody')
            .type('text/plain')
            .send(
                `a | http://a.com [link](http://a.com "name") [link2]( http://a.com ) *test1* __test2__ \`\`\`x\`xx\`  \`\`\` a! | ![](https://s.exhentai.org/t/56/ab/56abfaf1c30726478ded049645d3b074891315be-933888-4140-6070-jpg_l.jpg) ![图](http://xx.com "aaa") ![图2]( http://xx.com) | https://zh.moegirl.org.cn/%E5%AF%86%E6%B6%85%E7%93%A6(%E5%85%AC%E4%B8%BB%E8%BF%9E%E7%BB%93)`,
            )
            .set('accept', 'application/html+json')
            .expect(HttpStatus.OK);
        expect(_.body).toEqual({
            raw: 'a',
            name: '<p><a href="http://a.com">http://a.com</a> <a href="http://a.com" title="name">link</a> <a href="http://a.com">link2</a> <em>test1</em> <strong>test2</strong> <abbr>x`xx`</abbr> a!</p>',
            intro: '<p><img src="https://ehgt.org/56/ab/56abfaf1c30726478ded049645d3b074891315be-933888-4140-6070-jpg_l.jpg" nsfw="R18"> <img src="http://xx.com" title="aaa" alt="图"> <img src="http://xx.com" alt="图2"></p>',
            links: '<p><a href="https://zh.moegirl.org.cn/密涅瓦%28公主连结%29">萌娘百科</a></p>',
            logs: [
                {
                    logger: 'error',
                    message: '无效标签引用：`x`xx`` 不是一个有效的标签。',
                },
            ],
        });
    });

    it('GET /tools/parse/parody text.json', async () => {
        const _ = await supertest(app.getHttpServer())
            .post('/tools/parse/parody')
            .type('text/plain')
            .send(
                `a | http://a.com [link](http://a.com "name") [link2]( http://a.com ) *test1* __test2__ \`\`\`x\`xx\`  \`\`\` a! | ![](https://s.exhentai.org/t/56/ab/56abfaf1c30726478ded049645d3b074891315be-933888-4140-6070-jpg_l.jpg) ![图](http://xx.com "aaa") ![图2]( http://xx.com) | https://zh.moegirl.org.cn/%E5%AF%86%E6%B6%85%E7%93%A6(%E5%85%AC%E4%B8%BB%E8%BF%9E%E7%BB%93)`,
            )
            .query({ format: 'text.json' })
            .expect(HttpStatus.OK);
        expect(_.body).toEqual({
            raw: 'a',
            name: 'http://a.com link link2 test1 test2 x`xx` a!',
            intro: '',
            links: '萌娘百科',
            logs: [
                {
                    logger: 'error',
                    message: '无效标签引用：`x`xx`` 不是一个有效的标签。',
                },
            ],
        });
    });

    it('GET /octokit/release (raw)', async () => {
        const _ = await supertest(app.getHttpServer())
            .get('/octokit/release')
            .set('accept-encoding', '')
            .expect(HttpStatus.OK);
        expect(_.header['content-encoding']).toBe(undefined);
        expect(_.body.assets).toBeInstanceOf(Array);
    });

    it('GET /octokit/release', async () => {
        const _ = await supertest(app.getHttpServer()).get('/octokit/release').expect(HttpStatus.OK);
        expect(_.header['content-encoding']).toBe('gzip');
        expect(_.body.assets).toBeInstanceOf(Array);
    });

    it('GET /octokit/release (br)', async () => {
        const _ = await supertest(app.getHttpServer())
            .get('/octokit/release')
            .set('Accept-Encoding', 'br')
            .expect(HttpStatus.OK);
        expect(_.header['content-encoding']).toBe('br');
        expect(_.body.assets).toBeInstanceOf(Array);
    });
});
