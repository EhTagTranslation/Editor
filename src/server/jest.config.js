const path = require('path')

/** @typedef {import('ts-jest')} */
/** @type {import('@jest/types').Config.InitialOptions} */
module.exports = {
    moduleFileExtensions: ['js', 'json', 'ts'],
    rootDir: __dirname,
    testEnvironment: 'node',
    testRegex: '(test|\\.spec)\\.ts$',
    transform: {
        '^.+\\.(t|j)s$': 'ts-jest',
    },
    globals: {
        'ts-jest': {
            tsconfig: path.resolve(__dirname, './tsconfig.test.json'),
        },
    },
};
