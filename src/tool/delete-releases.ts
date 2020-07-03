import { Octokit } from '@octokit/rest';
import path from 'path';
import { action } from './utils';
import Git from 'simple-git';
import { program, Command } from 'commander';

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
        const raw = git.raw.bind(git);
        const remote = action.isAction()
            ? `https://${action.actor}:${action.token}@github.com/${action.repository}.git`
            : 'origin';
        const tags = (await raw(['ls-remote', '--tags', '--sort=-creatordate']))
            .split('\n')
            .filter((s) => !s.trim())
            .map((s) => `v-${s.split('\t')[0]}`);

        console.log(`Found ${tags.length} tags`);
        const old_tags = tags.slice(this.KEEP_RELEASE);

        if (old_tags.length > 0) {
            console.log(`Deleting ${old_tags.length} tags`);
            await raw(['push', remote, '--delete', ...old_tags]);
            await raw(['tag', '--delete', ...old_tags]);
        }
    }
}
program
    .command('delete-releases [repo]')
    .option('--no-releases', 'keep github releases')
    .option('--no-tags', 'keep git tags')
    .option('--keep <n>', 'keep latest n releases')
    .action(async (repo: string | undefined, command: Command) => {
        const opt = command.opts();
        const main = new Main(opt.keep ? Number.parseInt(opt.keep) : undefined, repo);
        if (opt.releases) await main.deleteRelease();
        if (opt.tags) await main.deleteTag();
    });
