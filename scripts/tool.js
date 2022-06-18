import fs from 'fs-extra';

const removedPackages = ['lazysizes', 'zone.js'];
const removedPackageHeaders = ['@angular', 'angular', '@nestjs/', 'fastify'];

/** @type {import('type-fest').PackageJson} */
const packageJson = await fs.readJSON('./package.json');
packageJson.scripts = undefined;
packageJson.devDependencies = undefined;
for (const key in packageJson.dependencies) {
    if (removedPackageHeaders.some((leading) => key.startsWith(leading)) || removedPackages.includes(key)) {
        packageJson.dependencies[key] = undefined;
    }
}
for (const key in packageJson.imports) {
    const value = packageJson.imports[key];
    if (typeof value == 'string') {
        packageJson.imports[key] = value.replace(/^.\/dist\//, './');
    }
}
for (const key in packageJson.exports) {
    const value = packageJson.exports[key];
    if (typeof value == 'string') {
        packageJson.imports[key] = value.replace(/^.\/dist\//, './');
    }
}
await fs.writeJSON('./dist/package.json', packageJson);
await fs.writeFile('./dist/index.js', 'import "./tool/index.js";');
