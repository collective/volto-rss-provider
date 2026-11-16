import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { defineMessages, injectIntl } from 'react-intl';
import Helmet from '@plone/volto/helpers/Helmet/Helmet';
import { addAppURL, flattenToAppURL } from '@plone/volto/helpers/Url/Url';
import config from '@plone/volto/registry';

import { getFeedListing } from '../../helpers/getFeedListing';

const messages = defineMessages({
  rssFeed: {
    id: 'rssFeed',
    defaultMessage: 'RSS Feed',
  },
});

/**
 * Advertises the feed of the current content with a
 * `<link rel="alternate" type="application/rss+xml">` in the head.
 *
 * Opt-in: nothing is rendered unless `config.settings.rssFeed.autoDiscovery` is
 * true. The rule is the one of the express middleware that serves
 * `<content>/rss.xml`, so a page only advertises a feed that exists: a content
 * without a listing block in its layout gets no link.
 *
 * @function AutoDiscovery
 * @param {Object} props Component props.
 * @param {Object} props.content The content object from the store.
 * @param {Object} props.intl The react-intl instance.
 * @return {string|null} The Helmet link, or null.
 */
const AutoDiscovery = ({ content, intl }) => {
  if (!config.settings.rssFeed?.autoDiscovery) return null;
  if (!content?.['@id'] || !getFeedListing(content)) return null;

  const path = flattenToAppURL(content['@id']).replace(/\/+$/, '');

  return (
    <Helmet
      link={[
        {
          rel: 'alternate',
          title: intl.formatMessage(messages.rssFeed),
          href: `${addAppURL(path)}/rss.xml`,
          type: 'application/rss+xml',
        },
      ]}
    />
  );
};

/**
 * Property types.
 * @property {Object} propTypes Property types.
 * @static
 */
AutoDiscovery.propTypes = {
  /**
   * Content of the object
   */
  content: PropTypes.shape({
    /**
     * Id of the object
     */
    '@id': PropTypes.string,
  }),
};

export default injectIntl(
  connect((state) => ({
    content: state.content.data,
  }))(AutoDiscovery),
);
