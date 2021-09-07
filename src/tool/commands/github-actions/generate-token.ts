import { Octokit } from '@octokit/rest';
import { createAppAuth, StrategyOptions } from '@octokit/auth-app';
import { ensureEnv, action } from '../../utils';
import { command } from './command';
import type { OptionValues } from 'commander';

async function main(envName?: string): Promise<void> {
    const APP_ID = ensureEnv('APP_ID', Number.parseInt);
    const APP_KEY = ensureEnv('APP_KEY');
    const APP_INSTALLATION_ID = ensureEnv('APP_INSTALLATION_ID', Number.parseInt);
    const APP_CLIENT_ID = ensureEnv('APP_CLIENT_ID');
    const APP_CLIENT_SECRET = ensureEnv('APP_CLIENT_SECRET');

    const octokit = new Octokit({
        authStrategy: createAppAuth,
        auth: {
            appId: APP_ID,
            privateKey: APP_KEY,
            installationId: APP_INSTALLATION_ID,
            clientId: APP_CLIENT_ID,
            clientSecret: APP_CLIENT_SECRET,
        } as StrategyOptions,
    });
    const tokenRes = await octokit.apps.createInstallationAccessToken({
        installation_id: APP_INSTALLATION_ID,
    });
    const token = tokenRes.data.token;
    action.setSecret(token);
    action.exportVariable(envName ?? 'APP_TOKEN', token);
}

command
    .command('generate-token')
    .description('生成 GitHub token')
    .option('--env <NAME>', '生成的 token 导出到的环境变量名称')
    .action(async (options: OptionValues) => {
        action.ensureAction();
        await main(options.env);
    });
