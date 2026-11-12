# Release Notes

<!-- You should *NOT* be adding new change log entries to this file.
     You should create a file in the news directory instead.
     For helpful instructions, please see:
     https://6.docs.plone.org/contributing/index.html?highlight=towncrier#change-log-entry
-->

<!-- towncrier release notes start -->

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
