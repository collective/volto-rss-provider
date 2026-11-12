Advertise the feed of a content with a `<link rel="alternate">` in the head

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
