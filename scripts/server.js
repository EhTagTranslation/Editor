const fs = require('fs-extra');

const removedPackages = ['lazysizes', 'zone.js'];
const removedPackageHeaders = ['@angular', 'angular', '@actions/'];

/** @type {import('type-fest').PackageJson} */
const packageJson = fs.readJSONSync('./package.json');
packageJson.scripts = {
    start: 'node dist/server/main.js',
};
packageJson.devDependencies = undefined;
for (const key in packageJson.dependencies) {
    if (removedPackageHeaders.some((leading) => key.startsWith(leading)) || removedPackages.includes(key)) {
        packageJson.dependencies[key] = undefined;
    }
}
fs.writeJSONSync('./package.json', packageJson);
