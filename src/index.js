import rssFeedSVG from '@plone/volto/icons/rss.svg';
import { RSSFeedEdit, RSSFeedView } from './components';

import {
  SliderBlockView,
  SliderBlockEdit,
  ListingGridVariation,
} from './components/';

import heroSVG from '@plone/volto/icons/hero.svg';

// All your imports required for the config here BEFORE this line
import '@plone/volto/config';

const applyConfig = (config) => {
  config.settings = {
    ...config.settings,
    isMultilingual: false,
    supportedLanguages: ['en'],
    defaultLanguage: 'en',
  };

  // config.blocks.blocksConfig.rssfeed = {
  //   id: 'rssfeed',
  //   title: 'RSS Feed',
  //   icon: rssFeedSVG,
  //   group: 'common',
  //   view: RSSFeedView,
  //   edit: RSSFeedEdit,
  //   restricted: false,
  //   mostUsed: true,
  //   blockHasOwnFocusManagement: false,
  //   sidebarTab: 0,
  //   blockHasValue: (data) => data.url,
  // };

  config.views = {
    ...config.views,
    contentTypesViews: {
      ...config.views.contentTypesViews,
      rss_feed: RSSFeedView,
    },
  };

  // Add a Slider block
  config.blocks.blocksConfig.slider = {
    id: 'slider',
    title: 'Slider',
    icon: heroSVG,
    group: 'common',
    view: SliderBlockView,
    edit: SliderBlockEdit,
    restricted: false,
    mostUsed: true,
    sidebarTab: 1,
  };

  // Add a Grid variation to the Listing block
  config.blocks.blocksConfig.listing.variations = [
    ...config.blocks.blocksConfig.listing.variations,
    {
      id: 'listingGrid',
      title: 'Grid',
      template: ListingGridVariation,
    },
  ];

  return config;
};

export default applyConfig;
