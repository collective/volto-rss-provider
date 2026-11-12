# Release Notes

<!-- You should *NOT* be adding new change log entries to this file.
     You should create a file in the news directory instead.
     For helpful instructions, please see:
     https://6.docs.plone.org/contributing/index.html?highlight=towncrier#change-log-entry
-->

<!-- towncrier release notes start -->

## 1.1.0 (2026-11-12)

### Feature

- Advertise the feed of a content with a `<link rel="alternate">` in the head

  Pages that serve a feed said nothing about it: the `<link rel="alternate"
  type="application/rss+xml">` existed only on `rss_feed` content, where the view
  rendered it, so a `Document` with a listing block (a newsroom, a section page, the
  homepage) served a feed at `<path>/rss.xml` that no reader could discover.

  An `appExtra` now emits the link for every content with a listing block in its
  layout. It uses the same rule as the express middleware
  (`helpers/getFeedListing.js`), so a page advertises a feed only when that feed
  exists, and the link of a `rss_feed` content is emitted once, from the same place.

  It is opt-in, because it changes the head of every page with a listing block and
  that is a decision of the site, not of the add-on:

  ```js
  // config.settings.rssFeed.autoDiscovery, false by default
  config.settings.rssFeed = { autoDiscovery: true };
  ``` 
- Build the feed from the listing block in the layout, not from the first key

  A content object can hold more than one listing block, and `blocks` is returned
  as an object whose keys are not in the authored order. The middleware read
  `blocks[findBlocks(...)]` - `findBlocks` returns an **array**, so with two
  listing blocks the lookup stringified to `"id1,id2"` and found nothing: a content
  with a usable listing block answered 500 (or 404 since 1.0.2).

  The feed is now built from the first listing block that carries a query, walking
  the blocks in layout order with `visitBlocks` (`@plone/volto/helpers`). Blocks
  that are no longer referenced by the layout - orphans left behind by an edit -
  are never picked, and a listing nested in a container block is found as well.
  Measured on www.eea.europa.eu: `/en` has two listing blocks, only one of them in
  the layout; `/en/rss.xml` used to answer 500 and now serves the feed of the
  visible listing. 

### Bugfix

- Do not answer 500 when a title or a description is missing

  `truncateText()` read `text.length` without checking the value, so a content
  without a title, or an item of the query without a description, crashed the feed
  generation and answered 500 for a URL that is a valid feed. A missing text is now
  an empty string, and a missing `max_title_length` / `max_description_length`
  means "do not truncate". 
- Query the API through `++api++` in development too

  Both API calls were built as `apiPath + (__DEVELOPMENT__ ? '' : '/++api++') +
  path`. When a development server points at a remote site (`RAZZLE_INTERNAL_API_PATH`,
  as `make staging` does) the request went to the frontend origin without the
  `++api++` prefix, got HTML instead of JSON and every `*/rss.xml` answered 500 -
  including the feeds that work in production.

  The URLs are now built with `expandToBackendURL()` from `@plone/volto/helpers`,
  which is the same logic Volto uses for its own API calls: `(internalApiPath ||
  apiPath) + '/++api++' + path`, in every environment. `make staging` gets JSON
  back and the feeds can be checked locally. 
- Serve the feed as `application/rss+xml`, not `application/atom+xml`

  The generator produces an RSS 2.0 document but the middleware announced it as
  Atom. Readers that switch on the content type got the wrong format. 

### Internal

- Add unit tests for the RSS middleware

  Fourteen Jest tests against a real Express server, with `superagent` mocked, that
  pin the status of every branch: feed from the listing block, listing chosen from
  the layout rather than an orphan, nested container block, no listing block, a
  listing without a query, an HTML body, a missing parent, 401, 500, missing title
  and description, and the API path used in development.

  `jest-addon.config.js` now transforms `@plone` packages and TypeScript, defines
  `__SERVER__`, and maps `uuid` to a stub: Volto 18 depends on `uuid@14`, which is
  ESM only, ships no `main` and imports `node:crypto`, so Jest 26 cannot load the
  `Blocks` helpers at all. 

## 1.0.2 (2026-11-12)

### Bugfix

- Answer 404 instead of 500 for `rss.xml` paths whose parent is not a feed

  The middleware handles every path ending in `rss.xml`, but it assumed the parent
  is a content object with a listing block. When it is not, `getRssFeedData`
  throws `No query data found in listing block`; that error carries no response,
  so the catch fell through to the 500 branch. Feed readers that guess URLs got
  "Internal Server Error" (and a 500 in the logs) instead of "Not Found":
  `/rss.xml`, `/en/rss.xml`, `/en/analysis/rss.xml`. 

## 1.0.1 (2024-12-20)

## 1.0.0 (2024-09-17)
