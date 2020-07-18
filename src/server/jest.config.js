const path = require('path')

module.exports = {
    moduleFileExtensions: ['js', 'json', 'ts'],
    rootDir: '.',
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
