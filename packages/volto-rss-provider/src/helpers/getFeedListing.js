import { visitBlocks } from '@plone/volto/helpers/Blocks/Blocks';

/**
 * Finds the listing block that backs the feed of a content object.
 *
 * Blocks are visited in layout order, so a block that is no longer referenced
 * by the layout (an orphan left behind by an edit) is never picked. The order
 * of the keys in the JSON payload is not the authored order, so reading
 * `blocks[key]` directly does not tell which listing comes first.
 *
 * Used by the express middleware that serves `<content>/rss.xml` and by the
 * `AutoDiscovery` app extra that advertises it, so the link in the head and the
 * feed itself can never disagree.
 *
 * @function getFeedListing
 * @param {Object} content - The content object as returned by the API.
 * @return {Object|undefined} The first listing block that carries a query.
 */
export function getFeedListing(content) {
  let listing;
  visitBlocks(content, ([id, block]) => {
    if (
      !listing &&
      block?.['@type'] === 'listing' &&
      block.querystring?.query?.length
    ) {
      listing = block;
    }
  });
  return listing;
}
