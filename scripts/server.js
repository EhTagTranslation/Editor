const fs = require('fs-extra');

const removedPackages = ['lazysizes', 'material-design-icons', 'zone.js'];
const removedPackageHeaders = ['@angular/'];

const packageJson = fs.readJSONSync('./package.json');
packageJson.scripts = {
    prestart: 'which git || apt-get install --no-install-recommends -y git',
    start: 'node server/main.js',
};
packageJson.devDependencies = undefined;
for (const key in packageJson.dependencies) {
    if (removedPackageHeaders.some((leading) => key.startsWith(leading)) || removedPackages.includes(key)) {
        packageJson.dependencies[key] = undefined;
    }
}
fs.writeJSONSync('./dist/package.json', packageJson);
