module.exports = {
  testMatch: ['**/src/addons/**/?(*.)+(spec|test).[jt]s?(x)'],
  globals: {
    __CLIENT__: false,
    __SERVER__: true,
    __DEVELOPMENT__: true,
  },
  collectCoverageFrom: [
    'src/addons/**/src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
  ],
  transformIgnorePatterns: [
    '/node_modules/(?!(@plone|@root|@package|volto-slate)/).*/',
  ],
  moduleNameMapper: {
    // uuid 14 is ESM only, has no `main` and imports `node:crypto`, which
    // Jest 26 cannot resolve. Volto's Blocks helpers import it for block ids.
    '^uuid$': '<rootDir>/src/addons/volto-rss-provider/__mocks__/uuid.js',
    '@plone/volto/cypress': '<rootDir>/node_modules/@plone/volto/cypress',
    '@plone/volto/babel': '<rootDir>/node_modules/@plone/volto/babel',
    '@plone/volto/(.*)$': '<rootDir>/node_modules/@plone/volto/src/$1',
    '@package/(.*)$': '<rootDir>/src/$1',
    '@root/(.*)$': '<rootDir>/src/$1',
    '~/(.*)$': '<rootDir>/src/$1',
    'load-volto-addons':
      '<rootDir>/node_modules/@plone/volto/jest-addons-loader.js',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
  transform: {
    '^.+\\.js(x)?$': 'babel-jest',
    '^.+\\.ts(x)?$': 'babel-jest',
    '^.+\\.(png)$': 'jest-file',
    '^.+\\.(jpg)$': 'jest-file',
    '^.+\\.(svg)$': './node_modules/@plone/volto/jest-svgsystem-transform.js',
  },
  coverageThreshold: {
    global: {
      branches: 5,
      functions: 5,
      lines: 5,
      statements: 5,
    },
  },
};
