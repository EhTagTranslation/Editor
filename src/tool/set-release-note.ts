import { program } from 'commander';
import { action, ensureEnv } from './utils';

program
    .command('set-release-note [compare] [mirror-sha]')
    .description('generate release note and export then to environment')
    .action((compare?: string, mirrorSha?: string) => {
        let message = ensureEnv('COMMIT_MESSAGE');
        action.exportVariable('RELEASE_NAME', message.split('\n', 1)[0]);
        if (compare)
            message += `\n\n上次发布以来的更改 https://github.com/EhTagTranslation/Database/compare/${compare}`;
        if (mirrorSha)
            message += `\n\n也可以从 [EhTagTranslation/DatabaseReleases](https://github.com/EhTagTranslation/DatabaseReleases/tree/${mirrorSha}) 获取`;
        action.exportVariable('RELEASE_BODY', message);
    });
