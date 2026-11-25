import { defineConfig } from 'vitest/config';
import voltoVitestConfig from '@plone/volto/vitest.config.mjs';
import path from 'path';
import { createRequire } from 'module';

const voltoRoot = path.resolve(__dirname, '../../core/packages/volto');
const requireFromVolto = createRequire(path.join(voltoRoot, 'package.json'));
// Packages the add-on code and tests import from the Volto environment.
// pnpm does not link Volto's dependencies into the add-on package, so
// resolve them from Volto.
const fromVolto = (name) =>
  path.dirname(requireFromVolto.resolve(`${name}/package.json`));

const addonAliases = {
  '@plone/volto': path.join(voltoRoot, 'src'),
  'prop-types': fromVolto('prop-types'),
  'react-intl': fromVolto('react-intl'),
  'react-redux': fromVolto('react-redux'),
  'redux-mock-store': fromVolto('redux-mock-store'),
};

// Volto's config runs the tests in `test.projects`, and each project has its
// own `resolve.alias`, so the add-on aliases must be added to every project.
const withAddonAliases = (config) => ({
  ...config,
  resolve: {
    ...config.resolve,
    alias: { ...config.resolve?.alias, ...addonAliases },
  },
});

export default defineConfig({
  ...withAddonAliases(voltoVitestConfig),
  test: {
    ...voltoVitestConfig.test,
    projects: voltoVitestConfig.test.projects.map(withAddonAliases),
  },
});
