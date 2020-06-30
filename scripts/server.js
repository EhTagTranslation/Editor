const fs = require('fs-extra');
const packageJson = fs.readJSONSync('./package.json');
packageJson.devDependencies = undefined;
packageJson.scripts = { start: 'apt install git -y && yarn install && node server/main.js' };
for (const key in packageJson.dependencies) {
    if (key.startsWith('@angular/')) packageJson.dependencies[key] = undefined;
}
fs.writeJSONSync('./dist/package.json', packageJson);
