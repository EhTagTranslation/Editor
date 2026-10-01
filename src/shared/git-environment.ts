const interactiveVariables = new Set(['GIT_ASKPASS', 'SSH_ASKPASS', 'GIT_PAGER', 'PAGER']);

/** Git 子进程不使用 IDE 注入的交互程序；空值也必须移除。 */
export function gitEnvironment(): NodeJS.ProcessEnv {
    return {
        ...Object.fromEntries(
            Object.entries(process.env).filter(([key]) => !interactiveVariables.has(key.toUpperCase())),
        ),
        GIT_TERMINAL_PROMPT: '0',
    };
}
