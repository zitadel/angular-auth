export default {
  preset: 'ts-jest/presets/default-esm',
  transform: {
    '^.+\\.m?[tj]sx?$': [
      'ts-jest',
      {
        useESM: true,
        tsconfig: 'tsconfig.jest.json',
      },
    ],
  },
  testEnvironment: 'jsdom',
  setupFiles: ['<rootDir>/test/setup.ts'],
  testMatch: ['**/*.+(spec|test).[tj]s?(x)'],
  moduleFileExtensions: [
    'ts',
    'tsx',
    'js',
    'mjs',
    'jsx',
    'mts',
    'json',
    'node',
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/frontend/',
    '/dist/',
    '/spec/',
    '/playground/',
  ],
  resetModules: false,
  collectCoverage: true,
  coverageDirectory: './build/coverage',
  collectCoverageFrom: ['src/**/*.{ts,tsx,js,jsx}', '!src/**/*.d.ts'],
  coverageReporters: ['clover', 'cobertura', 'lcov'],
  coveragePathIgnorePatterns: ['/dist/', '/spec/', '/node_modules/'],
  testTimeout: 60000,
  extensionsToTreatAsEsm: ['.ts', '.tsx', '.mts'],
  moduleNameMapper: {
    // rxjs only ships an ESM build under a `.js` extension without a package
    // `type: module`, which Jest cannot load; redirect to its CommonJS build.
    '^rxjs$': '<rootDir>/node_modules/rxjs/dist/cjs/index.js',
    '^rxjs/operators$':
      '<rootDir>/node_modules/rxjs/dist/cjs/operators/index.js',
    // Pin oidc-client-ts to its ESM build (transformed by ts-jest) so its named
    // exports resolve under Jest's ESM module runner.
    '^oidc-client-ts$':
      '<rootDir>/node_modules/oidc-client-ts/dist/esm/oidc-client-ts.js',
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  // Angular ships native ESM (`.mjs`) under `@angular/*`; allow ts-jest to
  // transform those packages (and `tslib`) instead of skipping `node_modules`
  // wholesale. rxjs is remapped to its CommonJS build via `moduleNameMapper`.
  transformIgnorePatterns: [
    '/node_modules/(?!(?:@angular|tslib|oidc-client-ts)/)',
  ],
  reporters: [
    'default',
    [
      'jest-junit',
      {
        outputDirectory: './build/reports',
        outputName: 'junit.xml',
      },
    ],
  ],
};
