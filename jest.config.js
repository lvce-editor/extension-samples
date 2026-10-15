export default {
  extensionsToTreatAsEsm: ['.ts'],
  injectGlobals: false,
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  modulePathIgnorePatterns: ['<rootDir>/dist/', '<rootDir>/.tmp/'],
  testMatch: ['<rootDir>/packages/**/test/**/*.test.ts'],
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        useESM: true,
        tsconfig: {
          allowImportingTsExtensions: true,
          module: 'ESNext',
          target: 'ESNext',
        },
      },
    ],
  },
}
