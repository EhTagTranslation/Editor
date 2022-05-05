import { action } from '../../utils';
import SimpleGit from 'simple-git';
import { command } from './command';
import { GitRepoInfoProvider } from '../../../shared/repo-info-provider';
import { Sha1Value } from '../../../shared/interfaces/ehtag';
import { lsRemoteTags } from './utils';
import type { OptionValues } from 'commander';

function compareInfo(before: string, after: string): string {
    return `上次发布以来的更改 https://github.com/${action.repository}/compare/${before}...${after}`;
}

function mirrorInfo(sha: string): string {
    const link = `\`${action.repository}Releases@${sha.slice(0, 7)}\``;
    const url = `https://github.com/${action.repository}Releases/tree/${sha}`;
    return `也可以从 [${link}](${url}) 获取`;
}

command
    .command('set-release-note')
    .description('生成发布消并导出到环境变量')
    .option('--mirror-sha <sha>', '镜像 commit 的 sha')
    .action(async (options: OptionValues) => {
        const head = await new GitRepoInfoProvider(process.cwd()).head();
        let message = head.message;
        action.exportVariable('RELEASE_NAME', head.message.split('\n', 1)[0]);
        const info = { message } as Record<string, string>;
        const git = SimpleGit();
        info['before'] = (await lsRemoteTags(git))[0]?.sha ?? Sha1Value.empty;
        info['after'] = head.sha;
        if (info['before'] && info['after']) {
            message += `\n\n${compareInfo(info['before'], info['after'])}`;
        }
        const { mirrorSha } = options;
        if (typeof mirrorSha == 'string') {
            message += `\n\n${mirrorInfo(mirrorSha)}`;
            info['mirror'] = mirrorSha;
        }
        action.exportVariable('RELEASE_BODY', message + `\n<!--\n${JSON.stringify(info, undefined, 2)}\n-->`);
    });
