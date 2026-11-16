# Volto RSS Provider (@plone-collective/volto-rss-provider)

A Volto addon to provide RSS feeds

[![npm](https://img.shields.io/npm/v/@plone-collective/volto-rss-provider)](https://www.npmjs.com/package/@plone-collective/volto-rss-provider)
[![](https://img.shields.io/badge/-Storybook-ff4785?logo=Storybook&logoColor=white&style=flat-square)](https://collective.github.io/volto-rss-provider/)
[![CI](https://github.com/collective/volto-rss-provider/actions/workflows/main.yml/badge.svg)](https://github.com/collective/volto-rss-provider/actions/workflows/main.yml)

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

## Installation

To install your project, you must choose the method appropriate to your version of Volto.


### Volto 18 and later

Add `@plone-collective/volto-rss-provider` to your `package.json`:

```json
"dependencies": {
    "@plone-collective/volto-rss-provider": "*"
}
```

Add `@plone-collective/volto-rss-provider` to your `volto.config.js`:

```javascript
const addons = ['@plone-collective/volto-rss-provider'];
```

If this package provides a Volto theme, and you want to activate it, then add the following to your `volto.config.js`:

```javascript
const theme = '@plone-collective/volto-rss-provider';
```

### Volto 17 and earlier

Create a new Volto project (you can skip this step if you already have one):

```
npm install -g yo @plone/generator-volto
yo @plone/volto my-volto-project --addon @plone-collective/volto-rss-provider
cd my-volto-project
```

Add `@plone-collective/volto-rss-provider` to your package.json:

```JSON
"addons": [
    "@plone-collective/volto-rss-provider"
],

"dependencies": {
    "@plone-collective/volto-rss-provider": "*"
}
```

Download and install the new add-on by running:

```
yarn install
```

Start volto with:

```
yarn start
```

## Test installation

Visit http://localhost:3000/ in a browser, login, and check the awesome new features.


## Development

The development of this add-on is done in isolation using a new approach using pnpm workspaces and latest `mrs-developer` and other Volto core improvements.
For this reason, it only works with pnpm and Volto 18 (currently in alpha).


### Prerequisites ✅

-   An [operating system](https://6.docs.plone.org/install/create-project-cookieplone.html#prerequisites-for-installation) that runs all the requirements mentioned.
-   [nvm](https://6.docs.plone.org/install/create-project-cookieplone.html#nvm)
-   [Node.js and pnpm](https://6.docs.plone.org/install/create-project.html#node-js) 24
-   [Make](https://6.docs.plone.org/install/create-project-cookieplone.html#make)
-   [Git](https://6.docs.plone.org/install/create-project-cookieplone.html#git)
-   [Docker](https://docs.docker.com/get-started/get-docker/) (optional)

### Installation 🔧

1.  Clone this repository, then change your working directory.

    ```shell
    git clone git@github.com:collective/volto-rss-provider.git
    cd volto-rss-provider
    ```

2.  Install this code base.

    ```shell
    make install
    ```


### Make convenience commands

Run `make help` to list the available commands.

```text
help                             Show this help
install                          Installs the add-on in a development environment
start                            Starts Volto, allowing reloading of the add-on during development
build                            Build a production bundle for distribution of the project with the add-on
i18n                             Sync i18n
ci-i18n                          Check if i18n is not synced
format                           Format codebase
lint                             Lint, or catch and remove problems, in code base
release                          Release the add-on on npmjs.org
release-dry-run                  Dry-run the release of the add-on on npmjs.org
test                             Run unit tests
ci-test                          Run unit tests in CI
backend-docker-start             Starts a Docker-based backend for development
storybook-start                  Start Storybook server on port 6006
storybook-build                  Build Storybook
acceptance-frontend-dev-start    Start acceptance frontend in development mode
acceptance-frontend-prod-start   Start acceptance frontend in production mode
acceptance-backend-start         Start backend acceptance server
ci-acceptance-backend-start      Start backend acceptance server in headless mode for CI
acceptance-test                  Start Cypress in interactive mode
ci-acceptance-test               Run cypress tests in headless mode for CI
```

### Development environment set up

Install package requirements.

```shell
make install
```

### Start developing

Start the backend.

```shell
make backend-docker-start
```

In a separate terminal session, start the frontend.

```shell
make start
```

### Lint code

Run ESlint, Prettier, and Stylelint in analyze mode.

```shell
make lint
```

### Format code

Run ESlint, Prettier, and Stylelint in fix mode.

```shell
make format
```

### i18n

Extract the i18n messages to locales.

```shell
make i18n
```

### Unit tests

Run unit tests.

```shell
make test
```

### Run Cypress tests

Run each of these steps in separate terminal sessions.

In the first session, start the frontend in development mode.

```shell
make acceptance-frontend-dev-start
```

In the second session, start the backend acceptance server.

```shell
make acceptance-backend-start
```

In the third session, start the Cypress interactive test runner.

```shell
make acceptance-test
```

## License

The project is licensed under the MIT license.

## Credits and acknowledgements 🙏

Generated using [Cookieplone (2.0.2)](https://github.com/plone/cookieplone) and [cookieplone-templates (5ecd252)](https://github.com/plone/cookieplone-templates/commit/5ecd252779556ee7422d64b8d4a1e632946fbc91) on 2026-10-19 18:31:59.064214. A special thanks to all contributors and supporters!
