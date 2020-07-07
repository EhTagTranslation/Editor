import 'source-map-support/register';
import './create-release';
import './delete-releases';
import './generate-token';
import './set-release-note';
import { program } from 'commander';

program.option('--force-action', '强制使用 GitHub Action 逻辑', (v) => {
    process.env.GITHUB_ACTIONS = 'true';
    return v;
});

program.parse();
