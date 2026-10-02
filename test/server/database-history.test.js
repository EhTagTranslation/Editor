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
import { GitRepoInfoProvider } from '#shared/repo-info-provider';

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

    function blockHistory(namespace) {
        const { promise: blocked, resolve: release, reject: fail } = Promise.withResolvers();
        const { promise: started, resolve: start } = Promise.withResolvers();
        const originalLog = GitRepoInfoProvider.prototype.log;
        const log = jest.spyOn(GitRepoInfoProvider.prototype, 'log').mockImplementation(async function (options) {
            if (Object.keys(options).some((key) => key.startsWith('-L') && key.endsWith(`:database/${namespace}.md`))) {
                start();
                await blocked;
            }
            return originalLog.call(this, options);
        });
        return { started, release, fail, log };
    }

    // 若历史仍占用仓库队列，让断言及时失败，并在 finally 中释放查询。
    async function whileHistoryBlocked(action) {
        let timer;
        try {
            return await Promise.race([
                action,
                new Promise((_, reject) => {
                    timer = setTimeout(() => reject(new Error('Operation blocked by history query')), 5000);
                }),
            ]);
        } finally {
            clearTimeout(timer);
        }
    }

    it('migrates an existing directory and skips unchanged pulls', async () => {
        expect(await service.data.sha()).toBe(initial);
        expect(service.data.data.female.has(raw)).toBe(true);
        expect(await service.pull()).toBeUndefined();
        expect(await readFile(path.join(service.path, '.info'), 'utf8')).toBe('{}');
    });

    it('caches repeated requests and shares queued queries while keeping namespaces separate', async () => {
        const log = jest.spyOn(GitRepoInfoProvider.prototype, 'log');
        const female = await service.blame('female', raw);
        expect(log).not.toHaveBeenCalled();
        const histories = await Promise.all([service.blame('male', raw), service.blame('male', raw)]);
        expect(histories).toEqual([female, female]);
        expect(log).toHaveBeenCalledTimes(1);
        expect(log.mock.calls[0][0]).toHaveProperty(['-L3,3:database/male.md']);

        await service.pull();
        await service.blame('female', raw);
        expect(log).toHaveBeenCalledTimes(1);
    });

    it('allows pulls, edits and pushes to finish while a history query is blocked', async () => {
        const gate = blockHistory('male');
        const history = service.blame('male', raw);
        try {
            await gate.started;
            expect(await whileHistoryBlocked(service.pull())).toBeUndefined();
            await whileHistoryBlocked(service.apply({ id: 3, login: 'editor' }, 'female', changeTag));
            const head = await service.data.sha();
            expect(head).not.toBe(initial);
            expect(await simpleGit(remote).revparse(['master'])).toBe(head);
            expect(service.data.data.female.get(raw).name.input).toBe('新名称');
        } finally {
            gate.release();
            await history;
        }
        expect(await history).toMatchObject({ sha: initial, commits: [{ sha: initial }] });
        const current = await service.blame('male', raw);
        expect(current.sha).toBe(await service.data.sha());
        expect(current.commits.map((entry) => entry.sha)).toEqual([initial]);
    });

    it('serializes history queries, shares in-flight requests and serves cached results without waiting', async () => {
        const cached = await service.blame('female', raw);
        const gate = blockHistory('male');
        const first = service.blame('male', raw);
        const duplicate = service.blame('male', raw);
        const next = service.blame('mixed', raw);
        try {
            await gate.started;
            // 排在快照任务后的拉取完成，证明所有请求已经准备好，仍只有一个 log 在运行。
            await whileHistoryBlocked(service.pull());
            expect(gate.log).toHaveBeenCalledTimes(1);
            expect(await whileHistoryBlocked(service.blame('female', raw))).toEqual(cached);
            expect(gate.log).toHaveBeenCalledTimes(1);
        } finally {
            gate.release();
            await Promise.all([first, duplicate, next]);
        }
        expect(await first).toEqual(await duplicate);
        expect((await first).commits).toBe((await duplicate).commits);
        expect((await next).commits.map((entry) => entry.sha)).toEqual([initial]);
        expect(gate.log).toHaveBeenCalledTimes(2);
    });

    it('shares failures, continues queued history and retries failed queries', async () => {
        const gate = blockHistory('male');
        const first = service.blame('male', raw);
        const duplicate = service.blame('male', raw);
        const next = service.blame('mixed', raw);
        const settled = Promise.allSettled([first, duplicate, next]);
        try {
            await gate.started;
            await whileHistoryBlocked(service.pull());
            expect(gate.log).toHaveBeenCalledTimes(1);
            gate.fail(new Error('history query failed'));
            expect(await settled).toMatchObject([
                { status: 'rejected', reason: { message: 'history query failed' } },
                { status: 'rejected', reason: { message: 'history query failed' } },
                { status: 'fulfilled', value: { sha: initial, commits: [{ sha: initial }] } },
            ]);
        } finally {
            gate.release();
            await settled;
        }
        gate.log.mockRestore();
        const log = jest.spyOn(GitRepoInfoProvider.prototype, 'log');
        expect((await service.blame('male', raw)).commits.map((entry) => entry.sha)).toEqual([initial]);
        await service.blame('male', raw);
        expect(log).toHaveBeenCalledTimes(1);
    });

    it('reuses history that finishes while a duplicate request is checking history readiness', async () => {
        const gate = blockHistory('male');
        const first = service.blame('male', raw);
        let duplicate;
        const { promise: checking, resolve: checked } = Promise.withResolvers();
        const { promise: blocked, resolve: release } = Promise.withResolvers();
        try {
            await gate.started;
            jest.spyOn(service, 'ensureHistory').mockImplementationOnce(async () => {
                checked();
                await blocked;
            });
            duplicate = service.blame('male', raw);
            await checking;
            gate.release();
            await first;
            release();
            expect(await duplicate).toEqual(await first);
            expect(gate.log).toHaveBeenCalledTimes(1);
        } finally {
            gate.release();
            release();
            await Promise.all([first, duplicate]);
        }
    });

    it.each([
        ['insert', (target) => header + '| before | 插入 | | |\n' + target + '| other | 其他 | | |\n'],
        ['move', (target) => header + '| other | 其他 | | |\n' + target],
        ['delete', () => header + '| other | 其他 | | |\n'],
    ])('keeps history and ETag pinned to the snapshot during a concurrent %s', async (action, content) => {
        const target = row.replace('描述', '快照描述');
        const sha = await upstreamCommit(header + target + '| other | 其他 | | |\n', '修改查询快照');
        await service.pull();
        const gate = blockHistory('female');
        const response = supertest(app.getHttpServer())
            .get('/database/female/test.tag/blame')
            .expect(200)
            .then((result) => result);
        let current;
        let changed;
        try {
            await gate.started;
            changed = await upstreamCommit(content(target), '查询期间变更条目');
            await whileHistoryBlocked(service.pull());
            expect(await service.data.sha()).toBe(changed);
            if (action === 'delete') {
                await supertest(app.getHttpServer())
                    .get('/database/female/test.tag/blame')
                    .timeout({ response: 5000 })
                    .expect(404)
                    .expect('ETag', `"${changed}"`);
            } else {
                current = service.blame('female', raw);
                await whileHistoryBlocked(service.pull());
            }
        } finally {
            gate.release();
            await Promise.all([response, current]);
        }
        const result = await response;
        expect(result.headers.etag).toBe(`"${sha}"`);
        expect(result.body.complete).toBe(true);
        expect(result.body.commits.map((entry) => entry.sha)).toEqual([sha, initial]);
        expect(gate.log.mock.calls[0][0]).toHaveProperty(sha);
        expect(gate.log.mock.calls[0][0]).toHaveProperty(['-L3,3:database/female.md']);
        if (current) {
            expect((await current).sha).toBe(changed);
            // 用独立的正则行选择核对新版本；Git 的 diff 对移动行可能按重新添加处理。
            const expected = await simpleGit(service.path).raw([
                'log',
                '--format=%H',
                '--no-patch',
                '-L/^[|][[:space:]]*test[.]tag[[:space:]]*[|]/,+1:database/female.md',
                changed,
            ]);
            expect((await current).commits.map((entry) => entry.sha)).toEqual(expected.trim().split('\n'));
            const beforeCacheHit = gate.log.mock.calls.length;
            expect(await service.blame('female', raw)).toEqual(await current);
            expect(gate.log).toHaveBeenCalledTimes(beforeCacheHit);
        }
    });

    it('evicts the least recently used history after 100 entries', async () => {
        const tags = Array.from({ length: 101 }, (_, index) => RawTag(`cache-${index}`));
        await upstreamCommit(header + tags.map((tag) => row.replace('test.tag', tag)).join(''), '创建缓存测试标签');
        await service.pull();
        // 只替换昂贵的 Git 历史查询，标签查找和缓存仍走真实服务路径。
        const log = jest.spyOn(GitRepoInfoProvider.prototype, 'log').mockResolvedValue({ commits: [], complete: true });
        for (const tag of tags.slice(0, 100)) await service.blame('female', tag);
        expect(log).toHaveBeenCalledTimes(100);
        await service.blame('female', tags[0]);
        await service.blame('female', tags[100]);
        expect(log).toHaveBeenCalledTimes(101);
        await service.blame('female', tags[0]);
        expect(log).toHaveBeenCalledTimes(101);
        await service.blame('female', tags[1]);
        expect(log).toHaveBeenCalledTimes(102);
    });

    it('retries failed Git history queries instead of caching errors', async () => {
        const log = jest
            .spyOn(GitRepoInfoProvider.prototype, 'log')
            .mockRejectedValueOnce(new Error('history query failed'));
        await expect(service.blame('male', raw)).rejects.toThrow('history query failed');
        expect((await service.blame('male', raw)).commits.map((entry) => entry.sha)).toEqual([initial]);
        await service.blame('male', raw);
        expect(log).toHaveBeenCalledTimes(2);
    });

    it.each([true, false])('caches incomplete results without retrying (has records: %s)', async (hasRecords) => {
        const cached = await service.blame('female', raw);
        const partial = { commits: hasRecords ? cached.commits : [], complete: false };
        const log = jest.spyOn(GitRepoInfoProvider.prototype, 'log').mockResolvedValueOnce(partial);
        const responses = await Promise.all([service.blame('male', raw), service.blame('male', raw)]);
        expect(responses).toEqual([
            { sha: initial, ...partial },
            { sha: initial, ...partial },
        ]);
        await supertest(app.getHttpServer())
            .get('/database/male/test.tag/blame')
            .expect(200)
            .expect('ETag', `"${initial}"`)
            .expect((res) => expect(res.body).toEqual(JSON.parse(JSON.stringify(partial))));
        await service.blame('male', raw);
        expect(log).toHaveBeenCalledTimes(1);
        // 超时结果不会挡住下一个标签的查询。
        expect((await service.blame('mixed', raw)).complete).toBe(true);
        expect(log).toHaveBeenCalledTimes(2);
    });

    it('uses the new HEAD when a pull is queued ahead of a cached history request', async () => {
        const changed = await upstreamCommit(header + row.replace('描述', '更新描述'), '修改标签');
        const pulling = service.pull();
        const history = service.blame('female', raw);
        await pulling;
        expect((await history).commits.map((entry) => entry.sha)).toEqual([changed, initial]);
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
            expect(history.commits.map((entry) => entry.sha)).toEqual([changed, initial]);
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
        expect(response.body.complete).toBe(true);
        expect(response.body.commits.map((entry) => entry.sha)).toEqual([edited, initial]);
        expect(response.body.commits[0]).toMatchObject({
            author: { name: 'original-author', email: '1+original-author@users.noreply.github.com' },
            message: expect.stringContaining('保留多行备注\n第二行'),
        });
        expect(Number.isNaN(Date.parse(response.body.commits[0].author.when))).toBe(false);
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
        expect((await service.blame('female', raw)).commits.map((entry) => entry.sha)).toEqual([changed, initial]);
        expect(await pathExists(shallow)).toBe(false);
    });

    it('retries failed history fetching without returning truncated history or breaking reads', async () => {
        const changed = await upstreamCommit(header + row.replace('描述', '更新描述'), '修改标签');
        await simpleGit(service.path).fetch('origin', 'master', ['--depth=1']);
        await service.pull();
        const fetch = jest.spyOn(service.git, 'fetch').mockRejectedValueOnce(new Error('history fetch failed'));
        await expect(service.blame('female', raw)).rejects.toThrow('history fetch failed');
        await supertest(app.getHttpServer()).get('/database/female/test.tag').expect(200);
        expect((await service.blame('female', raw)).commits.map((entry) => entry.sha)).toEqual([changed, initial]);
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
                expect(history.commits.map((entry) => entry.author.name)).toEqual(['editor', 'original-author']);
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
        expect(history.commits[0]).toMatchObject({
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
        expect((await service.blame('female', raw)).commits[0].author.name).toBe('editor');
    });
});
