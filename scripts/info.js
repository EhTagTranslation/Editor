const fs = require('fs-extra');

const removedPackages = ['lazysizes', 'material-design-icons', 'zone.js'];
const removedPackageHeaders = ['@angular/', '@nestjs/', 'fastify'];

function setenv(k, v) {
    console.log(`::set-env name=${k}::${v}`);
}

/** @type {import('type-fest').PackageJson} */
const packageJson = fs.readJSONSync('./package.json');
setenv('PACKAGE_VERSION', packageJson.version);
setenv('PACKAGE_NAME', packageJson.name);
