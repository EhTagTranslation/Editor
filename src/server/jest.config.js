import path from 'node:path';
import url from 'node:url';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

/** @typedef {import('ts-jest')} */
/** @type {import('@jest/types').Config.InitialOptions} */
const config = {
    moduleFileExtensions: ['js', 'json', 'ts'],
    rootDir: path.resolve(__dirname, '../..'),
    roots: ['<rootDir>/src/'],
    setupFilesAfterEnv: ['<rootDir>/src/server/setup-jest.ts'],
    moduleNameMapper: {
        '^shared/.*$': '<rootDir>/src/$0',
        '^server/.*$': '<rootDir>/src/$0',
    },
    extensionsToTreatAsEsm: ['.ts'],
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

export default config;
