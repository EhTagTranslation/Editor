import type { Sha1Value } from '../shared/interfaces/ehtag';
import * as actionsCore from '@actions/core';
import * as actionsExec from '@actions/exec';

export function ensureEnv<T>(name: string, parser: (s: string) => T): T;
export function ensureEnv(name: string): string;
export function ensureEnv<T>(name: string, parser?: (s: string) => T): T {
    const env = process.env[name];
    if (env == null) throw new Error(`Environment variable '${name}' required.`);
    if (!parser) return env as unknown as T;
    return parser(env);
}

class GithubAction {
    /** 触发工作流程的提交 SHA。 例如 ffac537e6cbbf934b08745a378932722df287a53。 */
    get sha(): Sha1Value {
        return ensureEnv('GITHUB_SHA') as Sha1Value;
    }
    /** 发起工作流程的个人或应用程序的名称。 例如 octocat。 */
    get actor(): string {
        return ensureEnv('GITHUB_ACTOR');
    }
    /** 所有者和仓库名称。 例如 octocat/Hello-World。 */
    get repository(): string {
        return ensureEnv('GITHUB_REPOSITORY');
    }

    get owner(): string {
        return this.repository.split('/')[0];
    }
    get repo(): string {
        return this.repository.split('/')[1];
    }
    get token(): string {
        return ensureEnv('GITHUB_TOKEN');
    }

    isAction(): boolean {
        return !!process.env['GITHUB_ACTIONS'];
    }
    ensureAction(): void {
        if (!this.isAction()) throw new Error(`Must run in github action.`);
    }
}

Object.defineProperties(GithubAction.prototype, Object.getOwnPropertyDescriptors(actionsCore));
Object.defineProperties(GithubAction.prototype, Object.getOwnPropertyDescriptors(actionsExec));

type ActionsCore = typeof actionsCore;
type ActionsExec = typeof actionsExec;
// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface GithubAction extends ActionsCore, ActionsExec {}

export const action = new GithubAction();
