import fs from 'fs-extra';
import { exportVariable } from '@actions/core';

/** @type {import('type-fest').PackageJson} */
const packageJson = await fs.readJSON('./package.json');
exportVariable('PACKAGE_VERSION', packageJson.version);
exportVariable('PACKAGE_NAME', packageJson.name);
