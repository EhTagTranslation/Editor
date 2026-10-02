// @ts-check
import { jest } from '@jest/globals';
import { EventEmitter } from 'node:events';
import { PassThrough } from 'node:stream';

const spawn = jest.fn();
jest.unstable_mockModule('node:child_process', () => ({ spawn }));
const { GitRepoInfoProvider } = await import('#shared/repo-info-provider');

const date = '2026-10-01T00:00:00+00:00';
function record(sha = 'a'.repeat(40), message = '标题\n\n多行备注\n第二行\n') {
    return Buffer.from(
        [sha, message, '作者', 'author@example.com', date, '提交者', 'bot@example.com', date, '\n'].join('\0'),
    );
}

describe('Git log deadline and partial output', () => {
    let child;
    let provider;

    beforeEach(() => {
        jest.useFakeTimers();
        child = Object.assign(new EventEmitter(), {
            stdout: new PassThrough(),
            stderr: new PassThrough(),
            kill: jest.fn(() => true),
        });
        spawn.mockReset().mockReturnValue(child);
        provider = new GitRepoInfoProvider(process.cwd());
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    function close(code = 0, signal = null) {
        child.stdout.end();
        child.stderr.end();
        child.emit('exit', code, signal);
        child.emit('close', code, signal);
    }

    it('parses records split across UTF-8 bytes and preserves multiline messages', async () => {
        const result = provider.log({ '--max-count': '2' });
        const output = Buffer.concat([record(), record('b'.repeat(40), '下一条\n')]);
        for (let index = 0; index < output.length; index += 5) child.stdout.write(output.subarray(index, index + 5));
        close();
        expect(await result).toMatchObject({
            complete: true,
            commits: [
                {
                    sha: 'a'.repeat(40),
                    message: '标题\n\n多行备注\n第二行\n',
                    author: { name: '作者', when: new Date(date) },
                },
                { sha: 'b'.repeat(40), message: '下一条\n' },
            ],
        });
        expect(child.kill).not.toHaveBeenCalled();
        expect(jest.getTimerCount()).toBe(0);
        expect(spawn.mock.calls[0][1]).toContain('--max-count=2');
    });

    it('enforces an absolute 60 second deadline despite continuing output and drops an unfinished record', async () => {
        const result = provider.log({ '--no-patch': null });
        child.stdout.write(record());
        jest.advanceTimersByTime(59_000);
        child.stdout.write(record('b'.repeat(40)));
        child.stdout.write(record('c'.repeat(40)).subarray(0, 55));
        jest.advanceTimersByTime(999);
        expect(child.kill).not.toHaveBeenCalled();
        jest.advanceTimersByTime(1);
        expect(child.kill).toHaveBeenCalledWith('SIGKILL');
        // 已过截止时间，即使终止期间还有数据到达，也不能追加。
        child.stdout.write(record('d'.repeat(40)));
        close(null, 'SIGKILL');
        const history = await result;
        expect(history.complete).toBe(false);
        expect(history.commits.map((commit) => commit.sha)).toEqual(['a'.repeat(40), 'b'.repeat(40)]);
        expect(jest.getTimerCount()).toBe(0);
    });

    it('returns an incomplete empty history if no complete record arrives before timeout', async () => {
        const result = provider.log({});
        child.stdout.write(record().subarray(0, -2));
        jest.advanceTimersByTime(60_000);
        close(null, 'SIGKILL');
        expect(await result).toEqual({ commits: [], complete: false });
    });

    it('does not time out while draining output after a successful process exit', async () => {
        const result = provider.log({});
        child.emit('exit', 0, null);
        jest.advanceTimersByTime(60_000);
        child.stdout.write(record());
        child.emit('close', 0, null);
        expect((await result).complete).toBe(true);
        expect(child.kill).not.toHaveBeenCalled();
    });

    it('reports Git errors instead of returning or caching successful partial history', async () => {
        const result = provider.log({});
        const assertion = expect(result).rejects.toThrow('invalid revision');
        child.stdout.write(record());
        child.stderr.write('invalid revision');
        close(128);
        await assertion;
        expect(jest.getTimerCount()).toBe(0);
    });

    it('reports spawn failures and clears the deadline', async () => {
        const result = provider.log({});
        const assertion = expect(result).rejects.toThrow('git not found');
        child.emit('error', new Error('git not found'));
        await assertion;
        expect(jest.getTimerCount()).toBe(0);
    });

    it('rejects malformed successful output and cannot invent HEAD from empty timed-out output', async () => {
        const result = provider.log({});
        const assertion = expect(result).rejects.toThrow('Incomplete git log record');
        child.stdout.write(record().subarray(0, -2));
        close();
        await assertion;
        const head = provider.head();
        const headAssertion = expect(head).rejects.toThrow('Invalid git log');
        jest.advanceTimersByTime(60_000);
        close(null, 'SIGKILL');
        await headAssertion;
    });
});
