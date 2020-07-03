import { program } from 'commander';
import { action } from './utils';
import readline from 'readline';

program
    .command('set-release-note [compare] [mirror-sha]')
    .description('generate release note and export then to environment')
    .action(async (compare?: string, mirrorSha?: string) => {
        const lines = Array<string>();
        for await (const line of readline.createInterface(process.stdin)) {
            lines.push(line);
        }
        action.exportVariable('RELEASE_NAME', lines[0]);
        let message = lines.join('\n');
        if (compare)
            message += `\n\n上次发布以来的更改 https://github.com/EhTagTranslation/Database/compare/${compare}`;
        if (mirrorSha)
            message += `\n\n也可以从 [EhTagTranslation/DatabaseReleases](https://github.com/EhTagTranslation/DatabaseReleases/tree/${mirrorSha}) 获取`;
        action.exportVariable('RELEASE_BODY', message);
    });
