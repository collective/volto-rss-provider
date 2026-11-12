import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { IntlProvider } from 'react-intl';
import config from '@plone/volto/registry';
import Helmet from '@plone/volto/helpers/Helmet/Helmet';

import AutoDiscovery from './AutoDiscovery';

const mockStore = configureStore([]);

const PUBLIC_URL = 'https://www.example.org';

const listing = (overrides = {}) => ({
  '@type': 'listing',
  querystring: {
    query: [
      {
        i: 'portal_type',
        o: 'plone.app.querystring.operation.selection.any',
        v: ['News Item'],
      },
    ],
    b_size: '9',
  },
  ...overrides,
});

const content = (overrides = {}) => ({
  '@id': `${PUBLIC_URL}/en/newsroom`,
  '@type': 'Document',
  title: 'Newsroom',
  blocks: { listing: listing() },
  blocks_layout: { items: ['listing'] },
  ...overrides,
});

/**
 * Renders the component with the server API of `Helmet` and returns the links
 * it would put in the head of the rendered page, which is what crawlers see.
 *
 * @param {Object} data The content of the store.
 * @return {string} The markup of the links.
 */
const renderHeadLinks = (data) => {
  Helmet.canUseDOM = false;
  const store = mockStore({ content: { data } });
  renderToStaticMarkup(
    <Provider store={store}>
      <IntlProvider locale="en" messages={{}}>
        <AutoDiscovery />
      </IntlProvider>
    </Provider>,
  );
  return Helmet.renderStatic().link.toString();
};

beforeAll(() => {
  config.settings = {
    ...config.settings,
    apiPath: PUBLIC_URL,
    internalApiPath: undefined,
    publicURL: PUBLIC_URL,
  };
});

beforeEach(() => {
  config.settings.rssFeed = { autoDiscovery: true };
});

describe('AutoDiscovery', () => {
  it('advertises the feed of a content with a listing block in the layout', () => {
    const head = renderHeadLinks(content());

    expect(head).toContain('rel="alternate"');
    expect(head).toContain('type="application/rss+xml"');
    expect(head).toContain('title="RSS Feed"');
    expect(head).toContain(`href="${PUBLIC_URL}/en/newsroom/rss.xml"`);
  });

  it('advertises the feed of a rss_feed content', () => {
    const head = renderHeadLinks(
      content({
        '@id': `${PUBLIC_URL}/en/newsroom/rss-feeds/eeas-press-releases-rss`,
        '@type': 'rss_feed',
      }),
    );

    expect(head).toContain(
      `href="${PUBLIC_URL}/en/newsroom/rss-feeds/eeas-press-releases-rss/rss.xml"`,
    );
  });

  it('does not advertise a feed for a content without a listing block', () => {
    const head = renderHeadLinks(
      content({
        blocks: { title: { '@type': 'title' } },
        blocks_layout: { items: ['title'] },
      }),
    );

    expect(head).toBe('');
  });

  it('does not advertise a feed for an orphan listing block', () => {
    const head = renderHeadLinks(
      content({
        blocks: { orphan: listing() },
        blocks_layout: { items: [] },
      }),
    );

    expect(head).toBe('');
  });

  it('does not advertise a feed for a listing block without a query', () => {
    const head = renderHeadLinks(
      content({
        blocks: { listing: { '@type': 'listing', querystring: {} } },
      }),
    );

    expect(head).toBe('');
  });

  it('does not advertise a feed before the content is loaded', () => {
    expect(renderHeadLinks(undefined)).toBe('');
  });

  it('renders nothing when autodiscovery is disabled', () => {
    config.settings.rssFeed = { autoDiscovery: false };

    expect(renderHeadLinks(content())).toBe('');
  });

  it('renders nothing when autodiscovery is not configured', () => {
    config.settings.rssFeed = undefined;

    expect(renderHeadLinks(content())).toBe('');
  });
});
