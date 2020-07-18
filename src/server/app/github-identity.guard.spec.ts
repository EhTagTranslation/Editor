import { GithubIdentityGuard } from './github-identity.guard';

describe('GithubIdentityGuard', () => {
    it('should be defined', () => {
        expect(new GithubIdentityGuard()).toBeDefined();
    });
});
