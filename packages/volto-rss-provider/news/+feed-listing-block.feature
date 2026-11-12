Build the feed from the listing block in the layout, not from the first key

A content object can hold more than one listing block, and `blocks` is returned
as an object whose keys are not in the authored order. The middleware read
`blocks[findBlocks(...)]` - `findBlocks` returns an **array**, so with two
listing blocks the lookup stringified to `"id1,id2"` and found nothing: a content
with a usable listing block answered 500.

The feed is now built from the first listing block that carries a query, walking
the blocks in layout order with `visitBlocks()` (`@plone/volto/helpers`). Blocks
that are no longer referenced by the layout - orphans left behind by an edit -
are never picked, and a listing nested in a container block is found as well. A
content without such a listing block answers 404 instead of 500.

Measured on a site with two listing blocks on its homepage (`/en`), only one of
them in the layout: `/en/rss.xml` used to answer 500 and now serves the feed of
the visible listing.
