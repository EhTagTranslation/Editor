import path from 'node:path';
import url from 'node:url';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

/** @typedef {import('ts-jest')} */
/** @type {import('@jest/types').Config.InitialOptions} */
const config = {
    //  moduleFileExtensions: ['js', 'json', 'ts'],
    // rootDir: path.resolve(__dirname, '../..'),
    // roots: ['<rootDir>/'],
    setupFilesAfterEnv: ['./setup-jest.js'],
    // moduleNameMapper: {
    //     '^shared/.*$': '<rootDir>/src/$0',
    //     '^server/.*$': '<rootDir>/src/$0',
    // },
    testEnvironment: 'node',
    testRegex: '(\\.test|\\.spec)\\.js$',
    transform: {},

    collectCoverage: true,
    coverageProvider: 'v8',

    moduleNameMapper: {
        '^#(.*)$': '<rootDir>/../../dist/$1.js',
    },
};

export default config;
