// @ts-check
import { createRequire } from 'node:module';
import path from 'node:path';
import fs from 'fs-extra';
import esbuild from 'esbuild';

const watch = process.argv.includes('--watch');
const minify = process.argv.includes('--minify');

const external = [];

/** @type {import('type-fest').PackageJson} */
const packageJson = await fs.readJSON('./package.json');
const imports = packageJson.imports ?? {};
packageJson.scripts = undefined;
packageJson.devDependencies = undefined;
packageJson.resolutions = undefined;
packageJson.browser = undefined;
packageJson.type = 'module';
packageJson.imports = undefined;
for (const key in /** @type {object | undefined} */ (packageJson.exports)) {
    const value = packageJson.exports[key];
    if (typeof value == 'string') {
        packageJson.exports[key] = value.replace(/^.\/dist\//, './');
    }
}
if (!watch) {
    packageJson.dependencies = {};
    const require = createRequire(import.meta.url);
    for (const ext of external) {
        /** @type {import('type-fest').PackageJson} */
        const resolved = require(ext + '/package.json');
        packageJson.dependencies[ext] = resolved.version;
    }
} else {
    for (const ext in packageJson.dependencies) {
        external.push(ext);
    }
}

await fs.emptyDir('./dist/tool/');
await fs.writeJSON('./dist/tool/package.json', packageJson);

const configCommon = /** @satisfies { esbuild.BuildOptions } */ ({
    external: undefined,
    outdir: './dist/tool/',
    minify,
    charset: 'utf8',
    metafile: true,
    bundle: true,
    sourcemap: true,
    sourcesContent: false,
});
const configMain = /** @satisfies { esbuild.BuildOptions } */ ({
    ...configCommon,
    entryPoints: ['./src/tool/index.ts'],
    format: 'esm',
    platform: 'node',
    target: 'es2020',
    banner: {
        js: /* js */ `
            import { createRequire as __createRequire } from 'node:module';
            const require = __createRequire(import.meta.url);
        `
            .split('\n')
            .map((line) => line.trim())
            .join(''),
    },
});
const configJsonp = /** @satisfies { esbuild.BuildOptions } */ ({
    ...configCommon,
    entryPoints: ['./tools/flate.js'],
    format: 'iife',
    target: 'es6',
    minify: true,
});

if (watch) {
    const [contextMain, contextJsonp] = await Promise.all([esbuild.context(configMain), esbuild.context(configJsonp)]);
    await Promise.all([contextMain.watch(), contextJsonp.watch()]);
} else {
    const [resultMain, resultJsonp] = await Promise.all([esbuild.build(configMain), esbuild.build(configJsonp)]);
    await fs.writeJSON('./dist/tool-index.json', resultMain.metafile);
    await fs.writeJSON('./dist/tool-flate.json', resultJsonp.metafile);
}
