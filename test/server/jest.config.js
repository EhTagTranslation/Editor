import path from 'node:path';
import url from 'node:url';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

/** @typedef {import('ts-jest')} */
/** @type {import('@jest/types').Config.InitialOptions} */
const config = {
    rootDir: path.resolve(__dirname, '../..'),
    roots: ['<rootDir>/'],
    setupFilesAfterEnv: [path.resolve(__dirname, './setup-jest.js')],
    testEnvironment: 'node',
    testRegex: 'test/server/.+(\\.test|\\.spec)\\.js$',
    transform: {},

    collectCoverage: true,
    coverageProvider: 'v8',

    moduleNameMapper: {
        '^#(.*)$': '<rootDir>/dist/$1.js',
    },
};

export default config;
