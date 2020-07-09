import { program, Command } from 'commander';
import { action, ensureEnv } from '../utils';
import SimpleGit from 'simple-git';

function compareInfo(before: string, after: string): string {
    return `上次发布以来的更改 https://github.com/${action.repository}/compare/${before}...${after}`;
}

function mirrorInfo(sha: string): string {
    const link = `\`${action.repository}Releases@${sha.slice(0, 7)}\``;
    const url = `https://github.com/${action.repository}Releases/tree/${sha}`;
    return `也可以从 [${link}](${url}) 获取`;
}

program
    .command('set-release-note')
    .description('生成发布消并导出到环境变量')
    .option('--mirror-sha [sha]', '镜像 commit 的 sha')
    .action(async (command: Command) => {
        let message = ensureEnv('COMMIT_MESSAGE');
        action.exportVariable('RELEASE_NAME', message.split('\n', 1)[0]);
        const info = { message } as Record<string, string>;
        const git = SimpleGit();
        info.before = (await git.revparse([(await git.tags({ '--sort': '-creatordate' })).all[0]])).trim();
        info.after = (await git.revparse(['HEAD'])).trim();
        if (info.before && info.after) {
            message += `\n\n${compareInfo(info.before, info.after)}`;
        }
        const { mirrorSha } = command.opts();
        if (typeof mirrorSha == 'string') {
            message += `\n\n${mirrorInfo(mirrorSha)}`;
            info.mirror = mirrorSha;
        }
        action.exportVariable('RELEASE_BODY', `<!--\n${JSON.stringify(info, undefined, 2)}\n-->\n` + message);
    });
