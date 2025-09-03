// eslint-disable-next-line no-undef
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    testMatch: ['**/*.test.ts'],
    moduleFileExtensions: ['ts', 'js', 'json', 'node'],
    collectCoverage: false,
    coverageDirectory: 'coverage',
};
