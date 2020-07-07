import { program } from 'commander';
import { action, ensureEnv } from './utils';

function compareInfo(compare: string): string {
    return `上次发布以来的更改 https://github.com/${action.repository}/compare/${compare}`;
}

function mirrorInfo(sha: string): string {
    const link = `\`${action.repository}Releases@${sha.slice(0, 7)}\``;
    const url = `https://github.com/${action.repository}Releases/tree/${sha}`;
    return `也可以从 [${link}](${url}) 获取`;
}

program
    .command('set-release-note [compare] [mirror-sha]')
    .description('生成发布消并导出到环境变量', {
        compare: '生成的范围，形如 [start_sha]...[end_sha]',
        'mirror-sha': '镜像 commit 的 sha',
    })
    .action((compare?: string, mirrorSha?: string) => {
        let message = ensureEnv('COMMIT_MESSAGE');
        action.exportVariable('RELEASE_NAME', message.split('\n', 1)[0]);
        const info = { message } as Record<string, string>;
        if (compare) {
            message += `\n\n${compareInfo(compare)}`;
            [info.before, info.after] = compare.split('...');
        }
        if (mirrorSha) {
            message += `\n\n${mirrorInfo(mirrorSha)}`;
            info.mirror = mirrorSha;
        }
        action.exportVariable('RELEASE_BODY', `<!--\n${JSON.stringify(info, undefined, 2)}\n-->\n` + message);
    });
