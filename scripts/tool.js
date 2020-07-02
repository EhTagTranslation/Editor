const fs = require('fs-extra');

const removedPackages = ['lazysizes', 'material-design-icons', 'zone.js'];
const removedPackageHeaders = ['@angular/', '@nestjs/', 'fastify'];

/** @type {import('type-fest').PackageJson} */
const packageJson = fs.readJSONSync('./package.json');
packageJson.scripts = {
    start: 'node tool/main.js',
};
packageJson.devDependencies = undefined;
for (const key in packageJson.dependencies) {
    if (removedPackageHeaders.some((leading) => key.startsWith(leading)) || removedPackages.includes(key)) {
        packageJson.dependencies[key] = undefined;
    }
}
fs.writeJSONSync('./dist/package.json', packageJson);
