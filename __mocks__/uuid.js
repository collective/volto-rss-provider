/**
 * Minimal `uuid` stub for Jest.
 *
 * Volto 18 depends on `uuid@14`, which is ESM only, ships no `main` and imports
 * `node:crypto`. Jest 26 (Razzle) can neither resolve nor run it, and
 * `@plone/volto/helpers/Blocks/Blocks` imports `v4` from it. The middleware
 * under test never generates ids, so a counter is enough.
 */
let counter = 0;

export const v4 = () => {
  counter += 1;
  return `00000000-0000-4000-8000-${String(counter).padStart(12, '0')}`;
};
