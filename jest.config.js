module.exports = {
    testEnvironment: 'node',
    roots: ['<rootDir>/test'],
    testMatch: ['**/*.test.ts'],
    transform: {
        '^.+\\.tsx?$': 'ts-jest',
    },
    coveragePathIgnorePatterns: [
        'node_modules',
        'errors',
        'constants',
        'index.ts',
        'cloudformation-model.ts',
        '\\.module\\.ts',
        '\\.mock\\.ts',
    ],
};
