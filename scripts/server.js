const fs = require('fs-extra');

const packageJson = fs.readJSONSync('./package.json');
packageJson.devDependencies = undefined;
packageJson.dependencies = undefined;
packageJson.scripts = { prestart: 'which git || apt install git -y', start: 'node server/main.js' };
fs.writeJSONSync('./dist/package.json', packageJson);
