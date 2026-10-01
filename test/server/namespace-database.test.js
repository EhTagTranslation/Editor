// @ts-check
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { Database } from '#shared/database';
import { NamespaceName } from '#shared/interfaces/ehtag';
import { RawTag } from '#shared/raw-tag';
import { TagRecord } from '#shared/tag-record';

describe('NamespaceDatabase source line numbers', () => {
    let root;
    let database;
    let namespace;
    const first = RawTag('first');
    const last = RawTag('last');
    const header = '| 原始标签 | 名称 | 描述 | 外部链接 |\n| --- | --- | --- | --- |\n';
    const rows = '| first | 第一个 | 描述 | |\n| | 注释 | | |\n| last | 最后一个 | 描述 | |\n';

    beforeEach(async () => {
        await mkdir('db', { recursive: true });
        root = await mkdtemp(path.resolve('db/namespace-test-'));
        await mkdir(path.join(root, 'database'));
        await writeFile(path.join(root, 'version'), '7');
        await Promise.all(NamespaceName.map((ns) => writeFile(path.join(root, 'database', `${ns}.md`), header + rows)));
        database = await Database.create(root);
        namespace = database.data.female;
    });

    afterEach(async () => {
        if (root && root.startsWith(path.resolve('db') + path.sep)) await rm(root, { recursive: true, force: true });
    });

    function lineOf(raw) {
        return Array.from(namespace.raw()).find(([key]) => key === raw)?.[1].line;
    }

    async function expectFileLines() {
        const content = await readFile(namespace.file, 'utf8');
        const lines = content.split('\n');
        for (const [raw, entry] of namespace.raw()) {
            const expected = lines.findIndex((line) => line.startsWith(`| ${raw} |`)) + 1;
            expect(expected).toBeGreaterThan(0);
            expect(entry.line).toBe(expected);
        }
        const savedLines = Object.fromEntries(Array.from(namespace.raw(), ([raw, entry]) => [raw, entry.line]));
        await namespace.load();
        expect(Object.fromEntries(Array.from(namespace.raw(), ([raw, entry]) => [raw, entry.line]))).toEqual(
            savedLines,
        );
    }

    it.each(['\n', '\r\n'])('loads physical line numbers with %j line endings', async (newline) => {
        const content =
            '---\nname: 女性\ndescription: |\n  第一行\n  第二行\n---\n\n说明文字\n\n' + header + rows + '\n尾注\n';
        await writeFile(namespace.file, content.replaceAll('\n', newline));
        await namespace.load();
        expect(lineOf(first)).toBe(12);
        expect(lineOf(last)).toBe(14);
    });

    it('updates existing lines after serializing front matter and comments', async () => {
        expect(lineOf(first)).toBe(3);
        expect(lineOf(last)).toBe(5);
        namespace.frontMatters.description = '第一行\n第二行\n';
        await namespace.save();
        expect(lineOf(first)).toBeGreaterThan(3);
        expect(lineOf(last)).toBe(lineOf(first) + 2);
        await expectFileLines();
    });

    it('assigns new lines and adjusts existing lines after insertions, renames and deletions', async () => {
        const inserted = RawTag('inserted');
        const renamed = RawTag('renamed');
        const appended = RawTag('appended');
        const record = (name) => new TagRecord({ name, intro: '', links: '' }, namespace);
        namespace.add(inserted, record('插入'), 'before', last);
        expect(lineOf(inserted)).toBeUndefined();
        // 保存前已有条目仍指向原文件中的位置。
        expect(lineOf(last)).toBe(5);
        namespace.add(undefined, record('新注释'), 'after', inserted);
        namespace.add(appended, record('追加'));
        namespace.delete(first);
        namespace.set(last, record('重命名'), renamed);
        await namespace.save();
        expect(lineOf(first)).toBeUndefined();
        expect(lineOf(last)).toBeUndefined();
        expect(lineOf(renamed)).toBe(lineOf(inserted) + 2);
        expect(lineOf(appended)).toBe(lineOf(renamed) + 1);
        await expectFileLines();
    });

    it('keeps the previous source lines when writing fails', async () => {
        namespace.frontMatters.description = '增加多行\n改变行位置\n';
        const lines = Array.from(namespace.raw(), ([raw, entry]) => [raw, entry.line]);
        // 把目标路径替换为目录，触发真实的文件写入失败。
        await rm(namespace.file);
        await mkdir(namespace.file);
        await expect(namespace.save()).rejects.toThrow();
        expect(Array.from(namespace.raw(), ([raw, entry]) => [raw, entry.line])).toEqual(lines);
    });
});
