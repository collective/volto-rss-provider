# Changelog

<!-- You should *NOT* be adding new change log entries to this file.
     You should create a file in the news directory instead.
     For helpful instructions, please see:
     https://6.docs.plone.org/contributing/index.html#contributing-change-log-label
-->

<!-- towncrier release notes start -->

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
