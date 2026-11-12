import RSSFeedView from './components/RSSFeedView';
import AutoDiscovery from './components/AutoDiscovery/AutoDiscovery';

const applyConfig = (config) => {
  config.blocks.initialBlocks = {
    ...config.blocks.initialBlocks,
    rss_feed: [
      { '@type': 'title', fixed: true, required: true, disableNewBlocks: true },
      {
        '@type': 'listing',
        fixed: true,
        required: true,
        disableNewBlocks: true,
      },
    ],
  };

  config.views.contentTypesViews.rss_feed = RSSFeedView;
  config.views.layoutViewsNamesMapping.rss_feed_view = 'RSS Feed';

  // Autodiscovery is opt-in: it adds a link to the head of every content with
  // a listing block in its layout, which is a decision of the site, not of the
  // add-on. A site enables it with `config.settings.rssFeed.autoDiscovery`,
  // see components/AutoDiscovery/AutoDiscovery.jsx.
  config.settings.rssFeed = {
    autoDiscovery: false,
    ...(config.settings.rssFeed || {}),
  };

  config.settings.appExtras = [
    ...(config.settings.appExtras || []),
    {
      match: '',
      component: AutoDiscovery,
    },
  ];

  if (__SERVER__) {
    const makeMiddlewares = require('./express-middleware').default;

    config.settings.expressMiddleware = [
      ...config.settings.expressMiddleware,
      makeMiddlewares(),
    ];
  }

  return config;
};

export default applyConfig;
