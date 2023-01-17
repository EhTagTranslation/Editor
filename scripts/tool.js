// @ts-check
import { spawn } from 'node:child_process';
import path from 'node:path';

const [node, script, ...args] = process.argv;
const p = spawn(`rollup`, ['-c', path.resolve(script, '../tool.rollup.js'), ...args], {
    stdio: 'inherit',
    shell: true,
});
p.on('error', (...args) => console.log(args));
