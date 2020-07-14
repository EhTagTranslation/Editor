import { Octokit } from '@octokit/rest';
import path from 'path';
import { action } from '../../utils';
import Git from 'simple-git';
import { Command } from 'commander';
import command from './command';

command.command('publish-env').action(async () => {
    const octokit = new Octokit({ auth: action.token });
    const key = await octokit.repos.createDeployment({ owner: action.owner, repo: action.repo, key_id: 'mirrow' });
    key.data.
    const releases = await octokit.paginate(octokit.repos.listReleases, { owner: action.owner, repo: action.repo });
    console.log(`Found ${releases.length} releases`);
    const releases_to_delete = releases.slice(this.KEEP_RELEASE);
    for (let i = 0; i < releases_to_delete.length; i++) {
        const release = releases_to_delete[i];
        console.log(`[${i + 1}/${releases_to_delete.length}] Deleting ${release.target_commitish}`);
        await octokit.repos.deleteRelease({ owner: action.owner, repo: action.repo, release_id: release.id });
    }
});
