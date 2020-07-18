const path = require('path')

/** @typedef {import('ts-jest')} */
/** @type {import('@jest/types').Config.InitialOptions} */
const config= {
    moduleFileExtensions: ['js', 'json', 'ts'],
    rootDir: path.resolve(__dirname, '..'),
    setupFilesAfterEnv:[ "<rootDir>/server/setup-jest.ts"],
    moduleNameMapper: {
        "^shared/.*$": "<rootDir>/$0",
        "^server/.*$": "<rootDir>/$0",
    },
    testEnvironment: 'node',
    testRegex: '(\\.test|\\.spec)\\.ts$',
    transform: {
        '^.+\\.(t|j)s$': 'ts-jest',
    },
    globals: {
        'ts-jest': {
            tsconfig: path.resolve(__dirname, './tsconfig.test.json'),
        },
    },
};
module.exports = config;
