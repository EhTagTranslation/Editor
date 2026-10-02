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
    let clipboard;
    let snackBar;

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
        clipboard = { copy: jest.fn(() => true) };
        snackBar = { open: jest.fn() };
        component = new Component(
            connector,
            { resolve: (value) => `https://github.com/fixture/database/${value}` },
            clipboard,
            snackBar,
        );
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
                committer: {
                    name: 'bot',
                    email: '456+translation[bot]@users.noreply.github.com',
                    when: '2026-10-01T01:00:00Z',
                },
            },
        ]);
        expect(component.state).toBe('success');
        expect(component.entries[0]).toMatchObject({
            subject: '修改标签',
            body: '保留备注',
            authorInfo: {
                name: 'login',
                url: 'https://github.com/login',
                avatarUrl: 'https://github.com/login.png?size=48',
            },
            committerInfo: {
                name: 'translation[bot]',
                url: 'https://github.com/translation%5Bbot%5D',
            },
            commitUrl: `https://github.com/fixture/database/commit/${'a'.repeat(40)}`,
            expanded: false,
        });
        component.load();
        expect(connector.getBlame).toHaveBeenCalledTimes(1);
    });

    it('keeps ordinary Git authors without inventing GitHub profiles or duplicate committers', () => {
        const author = { name: '普通作者', email: 'author@example.com', when: '2026-10-01T00:00:00Z' };
        component.load();
        response.next([{ sha: 'b'.repeat(40), message: '仅标题', author, committer: { ...author } }]);
        expect(component.entries[0]).toMatchObject({ subject: '仅标题', body: '', authorInfo: { name: '普通作者' } });
        expect(component.entries[0].authorInfo.url).toBeUndefined();
        expect(component.entries[0].authorInfo.avatarUrl).toBeUndefined();
        expect(component.entries[0].committerInfo).toBeUndefined();
    });

    it('renders commit tables and links as Markdown while escaping raw HTML', () => {
        const author = { name: '作者', email: 'author@example.com', when: '2026-10-01T00:00:00Z' };
        component.load();
        response.next([
            {
                sha: 'c'.repeat(40),
                message:
                    '修改标签\n\n| 版本 | 外部链接 |\n| --- | --- |\n| 修改后 | [pixiv](https://www.pixiv.net/) \\| 保留 |\n\n<script>alert(1)</script>',
                author,
                committer: author,
            },
        ]);
        const html = component.entries[0].bodyHtml;
        expect(html).toContain('<table>');
        expect(html).toContain('<th>外部链接</th>');
        expect(html).toContain(
            '<a href="https://www.pixiv.net/" target="_blank" rel="noopener noreferrer">pixiv</a> | 保留',
        );
        expect(html).toContain('&lt;script&gt;alert(1)&lt;/script&gt;');
        expect(html).not.toContain('<script>');
    });

    it('copies the full SHA and reports clipboard success or failure', () => {
        const sha = 'a'.repeat(40);
        component.copySha(sha);
        expect(clipboard.copy).toHaveBeenCalledWith(sha);
        expect(snackBar.open).toHaveBeenLastCalledWith('已复制完整提交编号', '关闭', { duration: 3000 });
        clipboard.copy.mockReturnValue(false);
        component.copySha(sha);
        expect(snackBar.open).toHaveBeenLastCalledWith('复制失败，请手动复制提交编号', '关闭', { duration: 3000 });
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
