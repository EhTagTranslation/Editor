import path from 'path';
import Git from 'simple-git';
import { Octokit } from '@octokit/rest';
import { action } from '../../utils';
import { command } from './command';
import { lsRemoteTags } from './utils';
import { OptionValues } from 'commander';

class Main {
    constructor(readonly KEEP_RELEASE = 3, readonly REPO_PATH = '.') {
        this.REPO_PATH = path.resolve(REPO_PATH);
    }
    async deleteRelease(): Promise<void> {
        const octokit = new Octokit({ auth: action.token });
        const releases = await octokit.paginate(octokit.repos.listReleases, { owner: action.owner, repo: action.repo });
        console.log(`Found ${releases.length} releases`);
        const releases_to_delete = releases.slice(this.KEEP_RELEASE);
        for (let i = 0; i < releases_to_delete.length; i++) {
            const release = releases_to_delete[i];
            console.log(`[${i + 1}/${releases_to_delete.length}] Deleting ${release.target_commitish}`);
            await octokit.repos.deleteRelease({ owner: action.owner, repo: action.repo, release_id: release.id });
        }
    }

    async deleteTag(): Promise<void> {
        const git = Git(this.REPO_PATH);
        const remote = action.isAction()
            ? `https://${action.actor}:${action.token}@github.com/${action.repository}.git`
            : 'origin';
        const tags = await lsRemoteTags(git);

        console.log(`Found ${tags.length} tags`);
        const old_tags = tags.slice(this.KEEP_RELEASE);

        if (old_tags.length > 0) {
            console.log(`Deleting ${old_tags.length} tags`);
            await git.raw('push', remote, '--delete', ...old_tags.map((t) => t.tag));
        }
    }
}

command
    .command('delete-releases [repo]')
    .description('删除旧的发布和标签', { repo: 'REPO 的本地路径' })
    .option('--no-releases', '保留 GitHub Releases')
    .option('--no-tags', '保留 git 标签')
    .option('--keep <n>', '保留最新的 n 个发布')
    .action(async (repo: string | undefined, options: OptionValues) => {
        const main = new Main(options.keep ? Number.parseInt(options.keep) : undefined, repo);
        if (options.releases) await main.deleteRelease();
        if (options.tags) await main.deleteTag();
    });
