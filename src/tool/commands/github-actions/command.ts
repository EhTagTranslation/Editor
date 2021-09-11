import { program } from 'commander';
export { Command } from 'commander';

export const command = program
    .command('github-actions')
    .description('用于 GitHub Actions 的相关工具')
    .option('--force-action', '强制使用 GitHub Actions 逻辑', (v) => {
        process.env['GITHUB_ACTIONS'] = 'true';
        return v;
    });
