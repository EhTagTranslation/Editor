// @ts-check
import { jest } from '@jest/globals';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { simpleGit } from 'simple-git';
import { pathExists } from 'fs-extra/esm';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { ValidationPipe } from '@nestjs/common';
import { FastifyAdapter } from '@nestjs/platform-fastify';
import supertest from 'supertest';
import { DatabaseService } from '#server/database/database.service';
import { DatabaseController } from '#server/database/database.controller';
import { EtagInterceptor } from '#server/app/etag.interceptor';
import { NamespaceName } from '#shared/interfaces/ehtag';
import { RawTag } from '#shared/raw-tag';
import { TagRecord } from '#shared/tag-record';
import { gitEnvironment } from '#shared/git-environment';

jest.setTimeout(30_000);

describe('Git database synchronization and line history', () => {
    let root;
    let upstream;
    let source;
    let remote;
    let service;
    let app;
    let initial;
    let edited;
    const raw = RawTag('test.tag');
    const row = '| test.tag | 测试 | 描述 | 链接 |\n';
    const header = '| 原始标签 | 名称 | 描述 | 外部链接 |\n| --- | --- | --- | --- |\n';

    beforeEach(async () => {
        await mkdir('db', { recursive: true });
        root = await mkdtemp(path.resolve('db/history-test-'));
        source = path.join(root, 'source');
        const local = path.join(root, 'local');
        remote = path.join(root, 'remote.git');
        await mkdir(path.join(source, 'database'), { recursive: true });
        await writeFile(path.join(source, 'version'), '7');
        await Promise.all(
            NamespaceName.map((ns) => writeFile(path.join(source, 'database', `${ns}.md`), header + row)),
        );
        upstream = simpleGit(source);
        await upstream.init(['--initial-branch=master']);
        await upstream.addConfig('user.name', 'original-author');
        await upstream.addConfig('user.email', '1+original-author@users.noreply.github.com');
        await upstream.addConfig('core.autocrlf', 'false');
        await upstream.add('.');
        initial = (await upstream.commit('创建标签\n\n最初的备注')).commit;
        await simpleGit().clone(source, remote, ['--bare']);
        await upstream.addRemote('origin', remote);

        // 模拟旧的 API 同步目录，含无 Git 元数据的过时文件。
        await mkdir(path.join(local, 'database'), { recursive: true });
        await writeFile(path.join(local, 'version'), '7');
        await writeFile(path.join(local, 'database', 'female.md'), '过时内容');
        await writeFile(path.join(local, '.info'), '{}');
        service = new DatabaseService(new ConfigService({ DB_PATH: local, DB_REPO: 'fixture/database' }), {
            botUserInfo: async () => ({ id: 2, login: 'test-bot' }),
            getAppToken: async () => 'test-installation-token',
        });
        // 只替换测试远程地址，初始化、拉取、提交和推送仍执行真实 Git 命令。
        const pull = service.pull.bind(service);
        jest.spyOn(service, 'pull').mockImplementationOnce(async (force) => {
            await simpleGit(local).remote(['set-url', 'origin', remote]);
            return pull(force);
        });
        await service.onModuleInit();
        await service.blame('female', raw);
        jest.spyOn(service, 'onModuleInit').mockResolvedValue(undefined);
        jest.spyOn(service.logger, 'error').mockImplementation(() => undefined);

        const fixture = await Test.createTestingModule({
            controllers: [DatabaseController],
            providers: [{ provide: DatabaseService, useValue: service }, EtagInterceptor],
        }).compile();
        app = fixture.createNestApplication(new FastifyAdapter());
        app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
        await app.init();
        await app.getHttpAdapter().getInstance().ready();
    });

    afterEach(async () => {
        await app?.close();
        jest.restoreAllMocks();
        if (root && root.startsWith(path.resolve('db') + path.sep)) await rm(root, { recursive: true, force: true });
    });

    async function upstreamCommit(content, message) {
        await writeFile(path.join(source, 'database', 'female.md'), content);
        await upstream.add('database/female.md');
        const commit = await upstream.commit(message);
        await upstream.push('origin', 'master');
        return commit.commit;
    }

    it('migrates an existing directory and skips unchanged pulls', async () => {
        expect(await service.data.sha()).toBe(initial);
        expect(service.data.data.female.has(raw)).toBe(true);
        expect(await service.pull()).toBeUndefined();
        expect(await readFile(path.join(service.path, '.info'), 'utf8')).toBe('{}');
    });

    it('serves the latest database while initial full-history fetching is still pending', async () => {
        const changed = await upstreamCommit(header + row.replace('描述', '更新描述'), '修改标签');
        const migrating = new DatabaseService(
            new ConfigService({ DB_PATH: path.join(root, 'migrating'), DB_REPO: 'fixture/database' }),
            {},
        );
        jest.spyOn(migrating.logger, 'error').mockImplementation(() => undefined);
        let release;
        let started;
        const blocked = new Promise((resolve) => {
            release = resolve;
        });
        const fetching = new Promise((resolve) => {
            started = resolve;
        });
        const pull = migrating.pull.bind(migrating);
        jest.spyOn(migrating, 'pull').mockImplementationOnce(async (force) => {
            await migrating.git.remote(['set-url', 'origin', remote]);
            const fetch = migrating.git.fetch.bind(migrating.git);
            jest.spyOn(migrating.git, 'fetch').mockImplementation(async (...args) => {
                if (args[2]?.includes('--unshallow')) {
                    started();
                    await blocked;
                }
                return fetch(...args);
            });
            return pull(force);
        });
        let historyApp;
        try {
            await migrating.onModuleInit();
            await fetching;
            expect(await pathExists(path.join(migrating.path, '.git', 'shallow'))).toBe(true);
            jest.spyOn(migrating, 'onModuleInit').mockResolvedValue(undefined);
            const fixture = await Test.createTestingModule({
                controllers: [DatabaseController],
                providers: [{ provide: DatabaseService, useValue: migrating }, EtagInterceptor],
            }).compile();
            historyApp = fixture.createNestApplication(new FastifyAdapter());
            await historyApp.init();
            await historyApp.getHttpAdapter().getInstance().ready();
            await supertest(historyApp.getHttpServer()).head('/database').expect(200);
            const response = await supertest(historyApp.getHttpServer()).get('/database').expect(200);
            expect(response.body.head.sha).toBe(changed);
            await supertest(historyApp.getHttpServer()).get('/database/female/test.tag').expect(200);
            release();
            const history = await migrating.blame('female', raw);
            expect(history.map((entry) => entry.sha)).toEqual([changed, initial]);
            expect(await pathExists(path.join(migrating.path, '.git', 'shallow'))).toBe(false);
        } finally {
            release();
            await migrating._repoActing;
            await historyApp?.close();
        }
    });

    it('tracks only the target line across moved rows, preserving authors, dates and notes', async () => {
        await upstreamCommit(header + '| other | 其他 | | |\n' + row, '插入其他标签');
        edited = await upstreamCommit(
            header + '| other | 其他 | | |\n' + row.replace('描述', '更新描述'),
            '修改标签\n\n保留多行备注\n第二行',
        );
        await upstreamCommit(header + '| other | 其他修改 | | |\n' + row.replace('描述', '更新描述'), '修改其他标签');
        expect(await service.pull()).toEqual(['database/female.md']);
        const response = await supertest(app.getHttpServer()).get('/database/female/test.tag/blame').expect(200);
        expect(response.body.map((entry) => entry.sha)).toEqual([edited, initial]);
        expect(response.body[0]).toMatchObject({
            author: { name: 'original-author', email: '1+original-author@users.noreply.github.com' },
            message: expect.stringContaining('保留多行备注\n第二行'),
        });
        expect(Number.isNaN(Date.parse(response.body[0].author.when))).toBe(false);
        await supertest(app.getHttpServer())
            .get('/database/female/test.tag/blame')
            .set('If-None-Match', response.headers.etag)
            .expect(304);
    });

    it('rejects invalid parameters and returns 404 for missing tags', async () => {
        await supertest(app.getHttpServer()).get('/database/invalid/test.tag/blame').expect(400);
        await supertest(app.getHttpServer()).get('/database/female/invalid%2Ftag/blame').expect(400);
        await supertest(app.getHttpServer()).get('/database/female/missing/blame').expect(404);
        // 404 不会阻塞后续数据库任务。
        await supertest(app.getHttpServer()).get('/database/female/test.tag/blame').expect(200);
    });

    it('expands shallow history before serving line history', async () => {
        const changed = await upstreamCommit(header + row.replace('描述', '更新描述'), '修改标签');
        await simpleGit(service.path).fetch('origin', 'master', ['--depth=1']);
        const shallow = path.join(service.path, '.git', 'shallow');
        expect(await pathExists(shallow)).toBe(true);
        await service.pull();
        expect(await pathExists(shallow)).toBe(true);
        expect((await service.blame('female', raw)).map((entry) => entry.sha)).toEqual([changed, initial]);
        expect(await pathExists(shallow)).toBe(false);
    });

    it('retries failed history fetching without returning truncated history or breaking reads', async () => {
        const changed = await upstreamCommit(header + row.replace('描述', '更新描述'), '修改标签');
        await simpleGit(service.path).fetch('origin', 'master', ['--depth=1']);
        await service.pull();
        const fetch = jest.spyOn(service.git, 'fetch').mockRejectedValueOnce(new Error('history fetch failed'));
        await expect(service.blame('female', raw)).rejects.toThrow('history fetch failed');
        await supertest(app.getHttpServer()).get('/database/female/test.tag').expect(200);
        expect((await service.blame('female', raw)).map((entry) => entry.sha)).toEqual([changed, initial]);
        expect(fetch).toHaveBeenCalledTimes(2);
    });

    function changeTag(db) {
        const previous = db.get(raw);
        const next = new TagRecord({ name: '新名称', intro: '新的描述', links: '' }, db);
        db.set(raw, next);
        return { ok: raw, ov: previous, nk: raw, nv: next };
    }

    it.each(['', 'missing-interactive-program'])(
        'ignores inherited askpass and pager variables during startup, edits and history (%j)',
        async (value) => {
            const keys = ['GIT_ASKPASS', 'SSH_ASKPASS', 'GIT_PAGER', 'PAGER'];
            const previous = Object.fromEntries(keys.map((key) => [key, process.env[key]]));
            for (const key of keys) process.env[key] = value;
            try {
                service.onModuleInit.mockRestore();
                const pull = service.pull.bind(service);
                jest.spyOn(service, 'pull').mockImplementationOnce(async (force) => {
                    await simpleGit({ baseDir: service.path, allowEnvironment: ['GIT_TERMINAL_PROMPT'] })
                        .env(gitEnvironment())
                        .remote(['set-url', 'origin', remote]);
                    return pull(force);
                });
                await service.onModuleInit();
                await service.apply({ id: 3, login: 'editor' }, 'female', changeTag);
                const history = await service.blame('female', raw);
                expect(history.map((entry) => entry.author.name)).toEqual(['editor', 'original-author']);
                for (const key of keys) expect(process.env[key]).toBe(value);
            } finally {
                for (const key of keys) {
                    if (previous[key] === undefined) delete process.env[key];
                    else process.env[key] = previous[key];
                }
            }
        },
    );

    it('pushes edits with the user as author and App bot as committer', async () => {
        await service.apply({ id: 3, login: 'editor' }, 'female', changeTag);
        const history = await service.blame('female', raw);
        expect(history[0]).toMatchObject({
            author: { name: 'editor', email: '3+editor@users.noreply.github.com' },
            committer: { name: 'test-bot', email: '2+test-bot@users.noreply.github.com' },
            message: expect.stringContaining('修改 female:test.tag'),
        });
        expect(await simpleGit(remote).revparse(['master'])).toBe(await service.data.sha());
        expect(await readFile(path.join(service.path, '.git', 'config'), 'utf8')).not.toContain(
            'test-installation-token',
        );
    });

    it('rolls back rejected pushes and can sync and retry afterwards', async () => {
        await upstreamCommit(header + row.replace('测试', '远程名称'), '远程修改');
        await expect(service.apply({ id: 3, login: 'editor' }, 'female', changeTag)).rejects.toThrow();
        expect(await service.data.sha()).toBe(initial);
        expect(service.data.data.female.get(raw).name.input).toBe('测试');
        expect(await readFile(path.join(service.path, 'database', 'female.md'), 'utf8')).toBe(header + row);
        await service.pull();
        await service.apply({ id: 3, login: 'editor' }, 'female', changeTag);
        expect((await service.blame('female', raw))[0].author.name).toBe('editor');
    });
});
