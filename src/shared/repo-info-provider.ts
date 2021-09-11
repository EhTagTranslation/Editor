import simpleGit from 'simple-git';
import type { RepoInfo, Sha1Value } from './interfaces/ehtag';

export interface RepoInfoProvider {
    head(): Promise<RepoInfo['head']> | RepoInfo['head'];

    repo(): Promise<RepoInfo['repo']> | RepoInfo['repo'];
}

export class GitRepoInfoProvider implements RepoInfoProvider {
    constructor(readonly repoPath: string) {}
    private readonly git = simpleGit({ baseDir: this.repoPath });
    async head(): Promise<RepoInfo['head']> {
        if (!this.git) throw new Error('This is not a git repo');
        const commit = (
            await this.git.log({
                '--max-count': '1',
                format: {
                    sha: '%H',
                    message: '%B',
                    'author.name': '%an',
                    'author.email': '%ae',
                    'author.when': '%aI',
                    'committer.name': '%cn',
                    'committer.email': '%ce',
                    'committer.when': '%cI',
                },
            })
        ).latest;
        if (!commit) throw new Error('Invalid git log');
        return {
            sha: commit.sha as Sha1Value,
            message: commit.message,
            author: {
                name: commit['author.name'],
                email: commit['author.email'],
                when: new Date(commit['author.when']),
            },
            committer: {
                name: commit['committer.name'],
                email: commit['committer.email'],
                when: new Date(commit['committer.when']),
            },
        };
    }

    async repo(): Promise<RepoInfo['repo']> {
        const remote = await this.git.getRemotes(true);
        return remote[0].refs.fetch;
    }
}
