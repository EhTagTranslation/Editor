import { simpleGit, type Options } from 'simple-git';
import { spawn } from 'node:child_process';
import type { CommitHistory, RepoInfo, Sha1Value } from './interfaces/ehtag.js';
import { gitEnvironment } from './git-environment.js';

const GIT_LOG_TIMEOUT = 60_000;
const LOG_FORMAT = '%H%x00%B%x00%an%x00%ae%x00%aI%x00%cn%x00%ce%x00%cI%x00';

function parseHistory(output: Buffer, complete: boolean): CommitHistory {
    const fields = output.toString('utf8').split('\0');
    const commits: CommitHistory['commits'] = [];
    let index = 0;
    for (; index + 8 < fields.length; index += 8) {
        const [hash, message, authorName, authorEmail, authorDate, committerName, committerEmail, committerDate] =
            fields.slice(index, index + 8);
        const sha = hash.trim();
        const authorWhen = new Date(authorDate);
        const committerWhen = new Date(committerDate);
        if (!/^[a-f0-9]{40}$/.test(sha) || Number.isNaN(+authorWhen) || Number.isNaN(+committerWhen)) {
            throw new Error('Invalid git log record');
        }
        commits.push({
            sha: sha as Sha1Value,
            message,
            author: { name: authorName, email: authorEmail, when: authorWhen },
            committer: { name: committerName, email: committerEmail, when: committerWhen },
        });
    }
    // 超时可能发生在记录中间；丢弃未收到最后一个分隔符的记录。
    if (complete && fields.slice(index).join('\0').trim()) throw new Error('Incomplete git log record');
    return { commits, complete };
}

export interface RepoInfoProvider {
    head(): Promise<RepoInfo['head']> | RepoInfo['head'];

    repo(): Promise<RepoInfo['repo']> | RepoInfo['repo'];
}

export class GitRepoInfoProvider implements RepoInfoProvider {
    constructor(readonly repoPath: string) {}
    private readonly git = simpleGit({ baseDir: this.repoPath, allowEnvironment: ['GIT_TERMINAL_PROMPT'] }).env(
        gitEnvironment(),
    );
    async head(): Promise<RepoInfo['head']> {
        const {
            commits: [commit],
        } = await this.log({ '--max-count': '1' });
        if (!commit) throw new Error('Invalid git log');
        return commit;
    }

    async log(options: Options): Promise<CommitHistory> {
        const args = Object.entries(options).flatMap(([key, value]) =>
            value == null ? [key] : (Array.isArray(value) ? value : [value]).map((item) => `${key}=${item}`),
        );
        return new Promise((resolve, reject) => {
            const child = spawn(
                'git',
                ['--no-pager', 'log', ...args, '--no-color', '--encoding=UTF-8', `--format=${LOG_FORMAT}`],
                {
                    cwd: this.repoPath,
                    env: { ...gitEnvironment(), GIT_FLUSH: '1' },
                    windowsHide: true,
                    stdio: ['ignore', 'pipe', 'pipe'],
                },
            );
            const stdout: Buffer[] = [];
            const stderr: Buffer[] = [];
            let timedOut = false;
            const timer = setTimeout(() => {
                timedOut = true;
                child.kill('SIGKILL');
            }, GIT_LOG_TIMEOUT);
            child.stdout.on('data', (chunk: Buffer) => {
                if (!timedOut) stdout.push(chunk);
            });
            child.stderr.on('data', (chunk: Buffer) => stderr.push(chunk));
            child.once('error', (error) => {
                clearTimeout(timer);
                reject(error);
            });
            child.once('exit', () => clearTimeout(timer));
            child.once('close', (code, signal) => {
                clearTimeout(timer);
                if (!timedOut && code !== 0) {
                    reject(
                        new Error(
                            Buffer.concat(stderr).toString('utf8').trim() || `git log failed (${signal ?? code})`,
                        ),
                    );
                    return;
                }
                try {
                    resolve(parseHistory(Buffer.concat(stdout), !timedOut));
                } catch (error) {
                    reject(error instanceof Error ? error : new Error('Invalid git log', { cause: error }));
                }
            });
        });
    }

    async repo(): Promise<RepoInfo['repo']> {
        const remote = await this.git.getRemotes(true);
        return remote[0].refs.fetch;
    }
}
