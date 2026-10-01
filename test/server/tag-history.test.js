// @ts-check
import { jest } from '@jest/globals';
import { build } from 'esbuild';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
import { Subject } from 'rxjs';
import '@angular/compiler';

describe('Edit page history card', () => {
    let Component;
    let component;
    let response;
    let connector;

    beforeAll(async () => {
        const outfile = path.resolve('dist/test/tag-history.mjs');
        await build({
            entryPoints: ['src/browser/app/editor/tag-history/tag-history.component.ts'],
            outfile,
            bundle: true,
            packages: 'external',
            format: 'esm',
            platform: 'node',
            tsconfig: 'src/browser/tsconfig.json',
        });
        Component = (await import(pathToFileURL(outfile).href)).TagHistoryComponent;
    });

    beforeEach(() => {
        response = new Subject();
        connector = { getBlame: jest.fn(() => response) };
        component = new Component(connector, { resolve: (value) => `https://github.com/fixture/database/${value}` });
        component.namespace = 'female';
        component.raw = 'test.tag';
        component.ngOnChanges();
    });

    afterEach(() => component.ngOnDestroy());

    it('does not fetch until clicked and cannot refresh after success', () => {
        expect(connector.getBlame).not.toHaveBeenCalled();
        expect(component.state).toBe('idle');
        component.load();
        component.load();
        expect(component.state).toBe('loading');
        expect(connector.getBlame).toHaveBeenCalledTimes(1);
        response.next([
            {
                sha: 'a'.repeat(40),
                message: '修改标签\n\n保留备注',
                author: { name: '名称', email: '123+login@users.noreply.github.com', when: '2026-10-01T00:00:00Z' },
            },
        ]);
        expect(component.state).toBe('success');
        expect(component.entries[0]).toMatchObject({
            subject: '修改标签',
            body: '保留备注',
            authorName: 'login',
            authorUrl: 'https://github.com/login',
        });
        component.load();
        expect(connector.getBlame).toHaveBeenCalledTimes(1);
    });

    it('allows a retry only after failure, including empty successful history', () => {
        component.load();
        response.error(new Error('请求失败'));
        expect(component.state).toBe('error');
        response = new Subject();
        component.load();
        expect(connector.getBlame).toHaveBeenCalledTimes(2);
        response.next([]);
        expect(component.state).toBe('success');
        component.load();
        expect(connector.getBlame).toHaveBeenCalledTimes(2);
    });

    it('cancels stale requests on tag changes and waits for the next click', () => {
        component.load();
        const oldResponse = response;
        component.raw = 'other';
        component.ngOnChanges();
        expect(oldResponse.observed).toBe(false);
        oldResponse.next([{ message: '旧条目' }]);
        expect(component.state).toBe('idle');
        expect(component.entries).toEqual([]);
        expect(connector.getBlame).toHaveBeenCalledTimes(1);
        response = new Subject();
        component.load();
        expect(connector.getBlame).toHaveBeenLastCalledWith({ namespace: 'female', raw: 'other' });
        component.ngOnDestroy();
        expect(response.observed).toBe(false);
    });
});
