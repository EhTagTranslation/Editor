import { program } from 'commander';

export default program
    .command('github-actions')
    .description('用于 GitHub Action 的相关工具')
    .option('--force-action', '强制使用 GitHub Action 逻辑', (v) => {
        process.env.GITHUB_ACTIONS = 'true';
        return v;
    });
