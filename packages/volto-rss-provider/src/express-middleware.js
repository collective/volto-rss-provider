import express from 'express';
import superagent from 'superagent';
import RSS from 'rss';
import { expandToBackendURL, toPublicURL } from '@plone/volto/helpers/Url/Url';
import config from '@plone/volto/registry';

import { getFeedListing } from './helpers/getFeedListing';

/**
 * Retrieves the query data (search criteria) used by the listing block of the rss_feed content type
 * as well as the language, description, title, subjects (tags), date, max_description_length, and
 * max_title_length of the rss_feed.
 *
 * The returned query object will have the following format:
 * {
 *   query: [
 *     {
 *       i: <index>,
 *       o: <operator>,
 *       v: <value of the search criteria>
 *     }
 *   ],
 *   sort_order: 'ascending',
 *   b_size: 25,
 *   metadata_fields: '_all',
 *   b_start: 0
 * }
 *
 * @function getRssFeedData
 * @param {Object} req - The incoming Express request object.
 * @param {Object} settings - Configuration settings for the application.
 * @return {Object} An object containing the query data, language, description, and title of the rss_feed.
 * @throws Will throw an error if no listing block with a query is found or if the request fails.
 */
async function getRssFeedData(req, settings) {
  try {
    const request = superagent
      .get(expandToBackendURL(req.path.replace(/\/rss\.xml$/, '')))
      .accept('json');

    const authToken = req.universalCookies.get('auth_token');
    if (authToken) {
      request.set('Authorization', `Bearer ${authToken}`);
    }

    const response = await request;
    const json = JSON.parse(JSON.stringify(response.body));
    const listing = getFeedListing(json);
    if (!listing) {
      const error = new Error('No listing block with a query found in content');
      error.status = 404;
      throw error;
    }
    const queryData = listing.querystring;
    let language = json.language?.token ?? 'en';
    let description = json.description ?? 'A Volto RSS Feed';
    let title = json.title;
    let subjects = json.subjects;
    let date = json.effective;
    let max_description_length = json.max_description_length;
    let max_title_length = json.max_title_length;

    if (queryData?.sort_order !== null) {
      if (typeof queryData.sort_order === 'boolean') {
        queryData.sort_order = queryData.sort_order
          ? 'descending'
          : 'ascending';
      }
    }

    let query = {
      ...queryData,
      ...(!queryData.b_size && {
        b_size: settings.defaultPageSize,
      }),
      query: queryData?.query,
      metadata_fields: '_all',
      b_start: 0,
    };
    return {
      query,
      language,
      description,
      title,
      subjects,
      date,
      max_description_length,
      max_title_length,
    };
  } catch (err) {
    throw err;
  }
}

/**
 * Fetches the listing block items based on the provided query data.
 *
 * The function sends a POST request to the @querystring-search endpoint with the query data
 * and returns the items that match the search criteria.
 * ref: https://6.docs.plone.org/plone.restapi/docs/source/endpoints/querystringsearch.html
 *
 * @function fetchListingItems
 * @param {Object} query - The query data used for fetching items.
 * @param {string} authToken - The authentication token for authorized requests.
 * @return {Array} An array of items that match the query criteria.
 * @throws Will throw an error if the request fails.
 */
async function fetchListingItems(query, authToken) {
  try {
    const request = superagent
      .post(expandToBackendURL('/@querystring-search'))
      .send(query)
      .accept('json');

    if (authToken) {
      request.set('Authorization', `Bearer ${authToken}`);
    }

    const response = await request;
    return response.body.items;
  } catch (err) {
    throw err;
  }
}

/** Truncates the text to the specified length.
 * If the text is longer than the specified length, it will be truncated and '...' will be appended.
 * @function truncateText
 * @param {string} text - The text to be truncated.
 * @param {number} maxLength - The maximum length of the text.
 * @return {string} The truncated text.
 */
function truncateText(text, maxLength) {
  if (!text) return '';
  if (maxLength == null) return text;
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
}

/**
 * Creates an Express middleware for generating an RSS feed using the listing block of the
 * rss_feed content type.
 *
 * The middleware fetches the query data of the listing block, retrieves the matching items,
 * and generates an RSS feed in XML format, which is sent as the response.
 *
 * @function make_rssMiddleware
 * @return {Function} An Express middleware function for generating the RSS feed.
 */
function make_rssMiddleware() {
  const { settings } = config;

  async function rssMiddleware(req, res, next) {
    try {
      const {
        query,
        language,
        description,
        title,
        subjects,
        date,
        max_description_length,
        max_title_length,
      } = await getRssFeedData(req, settings);
      const items = await fetchListingItems(
        query,
        req.universalCookies.get('auth_token'),
      );
      const feedOptions = {
        title: truncateText(title, max_title_length),
        description: truncateText(description, max_description_length),
        feed_url: `${settings.publicURL}${req.path}`,
        site_url: settings.publicURL,
        generator: 'RSS Feed Generator',
        language: language,
        pubDate: new Date(date),
      };
      if (subjects) {
        for (let i = 0; i < subjects.length; i++) {
          feedOptions.categories = subjects;
        }
      }
      const feed = new RSS(feedOptions);

      items.forEach((item) => {
        let link = toPublicURL(item['getURL']);
        let enclosure = undefined;
        if (
          item.image_field &&
          item.image_scales &&
          item.image_scales[item.image_field]
        ) {
          const imageData = item.image_scales[item.image_field][0];
          const imageUrl = `${link
            .concat('/')
            .concat(
              item.image_scales[item.image_field][0].scales.preview.download,
            )}`;
          const mimeType = item['content-type'];
          const originalSize = imageData.size;
          enclosure = {
            url: imageUrl,
            type: mimeType,
            size: originalSize,
          };
        }
        feed.item({
          title: truncateText(item.title, max_title_length),
          description: truncateText(item.description, max_description_length),
          url: link,
          guid: item.UID,
          date: new Date(item.effective),
          author: item['listCreators']
            ? item['listCreators'].map((creator) => creator).join(', ')
            : undefined,
          categories: item.Subject ? item.Subject : [],
          enclosure: enclosure || undefined,
        });
      });

      const xml = feed.xml({ indent: true });
      res.setHeader('content-type', 'application/rss+xml');
      res.send(xml);
    } catch (err) {
      const status = err.status || err.response?.status;
      if (status === 401) {
        // Handle unauthorized errors
        res.status(401).json({
          error: 'Unauthorized',
          message:
            'You are not authorized to access the requested RSS feed. Please log in and try again.',
        });
      } else if (status === 404) {
        // Handle not found errors
        res.status(404).json({
          error: 'Not Found',
          message:
            'The requested RSS feed could not be found. Please verify the URL and try again.',
        });
      } else {
        // Handle other errors
        res.status(500).json({
          error: 'Internal Server Error',
          message:
            'An unexpected error occurred while generating the RSS feed. Please try again later.',
        });
      }
      return;
    }
  }

  return rssMiddleware;
}

export default function makeMiddlewares() {
  const middleware = express.Router();
  middleware.use(express.urlencoded({ extended: true }));
  middleware.all('**/rss.xml', make_rssMiddleware());

  middleware.id = 'rss-middleware';

  return middleware;
}
