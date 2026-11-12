# volto-rss-provider

The `volto-rss-provider` add-on enables RSS feed generation for a Volto site. It uses the `rss_feed` content type, which contains a listing block for querying items to be displayed in the RSS feed. The feed can be accessed via URLs like `http://<website-domain>/<path-to-feed>/rss.xml`.

To use this volto addon, you also need to install the [backend addon](https://github.com/collective/rss-provider) that frames the `rss_feed` content type.

## Features

- Generates RSS feeds using Express middleware.
- Supports Atom format for the feed.
- Customizable feed options based on the `rss_feed` content type.
- Allows users to specify tags, which become categories in the RSS feed.
- Supports a variety of item options, including authors, categories, and enclosures, such as images.

### Setting Up the RSS Feed

The `rss_feed` content type includes a listing block. Use the listing block to query the items you want to display in the feed. The generated feed will include the specified items in RSS XML format.

### Feed Options

The following options are supported for the RSS feed:

- **title**: The title of the RSS feed, truncated to a maximum length specified by `max_title_length`.
- **description**: A description of the RSS feed, truncated to a maximum length specified by `max_description_length`.
- **feed_url**: The URL to the RSS feed.
- **site_url**: The URL to the site the feed is for.
- **generator**: The name of the feed generator, statically set as `"RSS Feed Generator"`.
- **language**: The language of the feed content.
- **pubDate**: The publication date of the feed, derived from the `effective` field of the `rss_feed` content type.
- **categories**: Tags specified in the `rss_feed` content type, used as categories for the RSS feed.

### Item Options

The following options are supported for each item in the RSS feed:

- **title**: The title of the item, truncated to a maximum length specified by `max_title_length`.
- **description**: The description of the item, truncated to a maximum length specified by `max_description_length`.
- **url**: The URL to the item.
- **date**: The date the item became publicly available, derived from the `effective` field of the item.
- **author**: The authors of the item, derived from the `listCreators` data field and set by the `Creators` option.
- **categories**: The categories for the item, derived from the `Subject` data field and set by the `Tags` option.
- **enclosure**: This field typically represents media files (like images) associated with the item. The code checks for an image in the item’s `image_field` and its associated scales in `image_scales`. If found, it generates an enclosure with the image’s URL, MIME type, and size.

### Image Precedence

The precedence for images in the RSS feed is as follows:

1. `previewImage` (if available)
2. `leadImage` (if `previewImage` is not available)
3. `null` (if neither `previewImage` nor `leadImage` is available)

### Accessing the RSS Feed

After setting up the `rss_feed` content type and configuring the listing block, you can access the generated RSS feed at:

```
http://<website-domain>/<path-to-feed>/rss.xml
```

This URL will return the RSS feed in XML format.

### Autodiscovery

A page that serves a feed can advertise it with a
`<link rel="alternate" type="application/rss+xml">` in its `<head>`, so readers and
browsers can discover it. The add-on emits that link for every content that has a
listing block in its layout - the same rule the middleware uses to decide whether
`<path>/rss.xml` is a feed, so a page only advertises a feed that exists - and for
`rss_feed` content, which used to render the link from its view.

It is opt-in, because it changes the head of every page with a listing block:

```js
// config.js of the project, or of an add-on applied to it
config.settings.rssFeed = {
  ...config.settings.rssFeed,
  autoDiscovery: true,
};
```

The default is `false`: without this setting nothing is added to the head.

### RSS Feed Generation

This add-on uses the [rss](https://www.npmjs.com/package/rss) npm package to generate the RSS feed.

### Caveats

- **Image Enclosure Size**: For the image included in the enclosure of each RSS feed item, we are using its `preview` scale. However, due to limitations in retrieving the actual size of the `preview` image, the size of the original image is used instead in the enclosure. This may result in a discrepancy between the displayed image size and the reported size in the RSS feed.
