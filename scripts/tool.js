// @ts-check
import fs from 'fs-extra';
import path from 'node:path';
import { createRequire } from 'node:module';
import { rollup } from 'rollup';
import esbuild from 'rollup-plugin-esbuild';
import commonjs from '@rollup/plugin-commonjs';
import nodeResolve from '@rollup/plugin-node-resolve';
import json from '@rollup/plugin-json';
import alias from '@rollup/plugin-alias';

const external = ['vm2'];

/** @type {import('type-fest').PackageJson} */
const packageJson = await fs.readJSON('./package.json');
packageJson.scripts = undefined;
packageJson.devDependencies = undefined;
packageJson.dependencies = {};
packageJson.resolutions = undefined;
packageJson.browser = undefined;
packageJson.type = 'module';
for (const key in packageJson.imports) {
    const value = packageJson.imports[key];
    if (typeof value == 'string') {
        packageJson.imports[key] = value.replace(/^.\/dist\//, './');
    }
}
for (const key in /** @type {object | undefined} */ (packageJson.exports)) {
    const value = packageJson.exports[key];
    if (typeof value == 'string') {
        packageJson.exports[key] = value.replace(/^.\/dist\//, './');
    }
}
const require = createRequire(import.meta.url);
for (const ext of external) {
    /** @type {import('type-fest').PackageJson} */
    const resolved = require(ext + '/package.json');
    packageJson.dependencies[ext] = resolved.version;
}
await fs.emptyDir('./dist/tool/');
await fs.writeJSON('./dist/tool/package.json', packageJson);

const build = await rollup({
    onwarn: (warning) => {
        console.warn(warning.toString());
    },
    input: './src/tool/index.ts',
    external,
    plugins: [
        nodeResolve({
            preferBuiltins: true,
            exportConditions: ['node'],
        }),
        alias({
            entries: [
                {
                    find: /\/$/,
                    replacement: '',
                },
                {
                    find: /^#(.+)/,
                    replacement: path.join(process.cwd(), 'src') + '/$1.ts',
                },
            ],
        }),
        commonjs(),
        json(),
        esbuild({
            sourceMap: false,
            minify: true,
            target: 'es2020',
        }),
    ],
});
await build.write({
    format: 'esm',
    dir: './dist/tool/',
    compact: true,
});
await build.close();
