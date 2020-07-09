import 'source-map-support/register';
import './commands/create-release';
import './commands/delete-releases';
import './commands/generate-token';
import './commands/set-release-note';
import './commands/parse';
import { program } from 'commander';

program.option('--force-action', '强制使用 GitHub Action 逻辑', (v) => {
    process.env.GITHUB_ACTIONS = 'true';
    return v;
});

program.parse();
