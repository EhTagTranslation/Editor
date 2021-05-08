const fs = require('fs-extra');
const { exportVariable } = require('@actions/core');

/** @type {import('type-fest').PackageJson} */
const packageJson = fs.readJSONSync('./package.json');
exportVariable('PACKAGE_VERSION', packageJson.version);
exportVariable('PACKAGE_NAME', packageJson.name);
