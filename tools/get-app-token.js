import 'dotenv/config';
import { Octokit } from '@octokit/rest';
import { createAppAuth } from '@octokit/auth-app';

const app = new Octokit({
    userAgent: 'EhTagTranslation Nest',
    authStrategy: createAppAuth,
    auth: {
        appId: process.env.APP_ID,
        privateKey: process.env.APP_KEY,
        clientId: process.env.APP_CLIENT_ID,
        clientSecret: process.env.APP_CLIENT_SECRET,
        installationId: process.env.APP_INSTALLATION_ID,
    },
});
const appToken = await app.apps.createInstallationAccessToken({
    installation_id: process.env.APP_INSTALLATION_ID,
});
// console.log(appToken);
const repo = new Octokit({
    userAgent: 'EhTagTranslation Nest',
    auth: appToken.data.token,
});

console.log(await repo.orgs.checkBlockedUser({ org: 'EhTagTranslation', username: 'a1113028' }));
console.log(await repo.orgs.checkBlockedUser({ org: 'EhTagTranslation', username: 'OpportunityLiu' }));
