# Changelog

<!-- You should *NOT* be adding new change log entries to this file.
     You should create a file in the news directory instead.
     For helpful instructions, please see:
     https://6.docs.plone.org/contributing/index.html#contributing-change-log-label
-->

<!-- towncrier release notes start -->

## 2.0.0 (2026-11-25)


### Breaking

- Volto 19 support. The add-on is developed and released for Volto 19 and also builds against Volto 18, which the unit tests cover; Volto 17 is no longer supported. The repository is now a pnpm monorepo and the add-on moved to `packages/volto-rss-provider`. Yarn and npm lock files were replaced by pnpm (`pnpm-lock.yaml`, `pnpm-workspace.yaml`, `packageManager: pnpm@10.20.0`, `preinstall: npx only-allow pnpm`), so the development workflow is now `pnpm install`, `pnpm start`, `pnpm test`, and `pnpm build`. 


### Bugfix

- Declare `express` and `superagent` as dependencies instead of relying on Volto hoisting them. pnpm's strict `node_modules` layout does not expose transitive dependencies, so the add-on must declare the packages it imports. 
- Inline the `isIMEComposing` helper in the Title block Edit shadow instead of importing it from `@plone/volto/helpers/Utils/Utils`, which only exports it since Volto 19, so the add-on also builds on Volto 18. 
- Ship the LICENSE file in the published package: npm takes it only from the package directory, so the npm page had no license text even though the package declares MIT. 


### Internal

- Migrated the tests from Jest to Vitest (`vitest.config.mjs`), moved the Cypress acceptance tests from `acceptance/` to `cypress/` following the Volto 19 add-on layout, added a Storybook configuration, and added GitHub Actions workflows for CI, the towncrier changelog check, and Dependabot. Removed dead imports and unused state from `RSSFeedView` and `express-middleware`, and added `rel="noreferrer"` to the feed link. 


### Documentation

- Added the Sphinx documentation scaffold using Plone Sphinx Theme with a Read the Docs configuration, added the towncrier `news/` directory, and backfilled the 1.0.0 and 1.0.1 release notes from the Git history. 

## 1.0.1 (2024-12-20)

### Bugfix

- Fixed production URLs. Feed item links are now built with the public URL instead of the internal API URL, and the Express middleware reads the settings from the Volto registry instead of receiving the Volto configuration as an argument.
- Stopped overriding `isMultilingual`, `supportedLanguages`, and `defaultLanguage` in the add-on configuration.

## 1.0.0 (2024-09-17)

### Feature

- Added an Express middleware that serves an RSS 2.0 feed at `/rss.xml` for `rss_feed` content type pages. The feed is generated from the query of the page's listing block through the `@querystring-search` endpoint, and the `auth_token` cookie is forwarded as a bearer token.
- Registered `initialBlocks` for the `rss_feed` content type: a required `title` and `listing` block with `disableNewBlocks`.
- Added the `RSSFeedView` view, which renders the page blocks and a "Copy Feed link" button, and adds a `<link rel="alternate" type="application/rss+xml">` element to the page head.
- Added the feed channel metadata: title, description, language, site URL, publication date, and the page subjects as channel categories.
- Added the feed items with title, description, link, UID as GUID, the `effective` date as publication date, the creator names as author, the subjects as categories, and an image enclosure with the preview scale URL, the original image size, and its MIME type.
- Truncated the item titles and descriptions to `max_title_length` and `max_description_length` when the `rss_feed` item sets them.
- Returned JSON errors with the HTTP 401, 404, and 500 status codes when the upstream Plone request fails.

### Bugfix

- Fixed `undefined` and `null` errors when the page or the listing block has no query data.
- Corrected the item image enclosure URL and the production API path.
- Fixed the layout view name mapping of the `rss_feed` content type.

### Internal

- Converted the middleware from promises to `async`/`await`, simplified and refactored it, and dropped the unused `rss_feed_view` route.
- Prepared `package.json` for `release-it`.

### Documentation

- Documented the feed specification and the usage of the add-on in the README.
