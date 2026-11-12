import express from 'express';
import http from 'http';

import config from '@plone/volto/registry';
import superagent from 'superagent';

import makeMiddlewares from './express-middleware';

jest.mock('superagent', () => {
  const makeRequest = ({ body, error } = {}) => {
    const promise = error ? Promise.reject(error) : Promise.resolve({ body });
    const request = {
      sent: undefined,
      headers: {},
      accept: () => request,
      send: (payload) => {
        request.sent = payload;
        return request;
      },
      set: (key, value) => {
        request.headers[key] = value;
        return request;
      },
      then: (resolve, reject) => promise.then(resolve, reject),
      catch: (reject) => promise.catch(reject),
    };
    return request;
  };

  return { get: jest.fn(), post: jest.fn(), makeRequest };
});

const PUBLIC_URL = 'https://www.example.org';
const INTERNAL_API_PATH = 'http://backend:8080';
const API_PATH = 'http://localhost:3000';

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
    sort_on: 'effective',
    sort_order: 'descending',
    b_size: '3',
  },
  ...overrides,
});

const content = (overrides = {}) => ({
  '@type': 'Document',
  title: 'Newsroom',
  description: 'The latest news',
  effective: '2022-06-14T09:14:00+00:00',
  language: { title: 'English', token: 'en' },
  blocks: { title: { '@type': 'title' }, listing: listing() },
  blocks_layout: { items: ['title', 'listing'] },
  ...overrides,
});

const item = (overrides = {}) => ({
  title: 'First item',
  description: 'First description',
  getURL: `${PUBLIC_URL}/en/newsroom/news/first`,
  UID: 'uid-first',
  effective: '2026-11-02T10:00:00+00:00',
  Subject: ['Health'],
  listCreators: ['editor'],
  ...overrides,
});

let server;
let base;

const get = (path, headers = {}) =>
  new Promise((resolve, reject) => {
    http
      .get(`${base}${path}`, { headers }, (res) => {
        let body = '';
        res.setEncoding('utf8');
        res.on('data', (chunk) => {
          body += chunk;
        });
        res.on('end', () => {
          resolve({
            status: res.statusCode,
            type: res.headers['content-type'],
            body,
          });
        });
      })
      .on('error', reject);
  });

const mockGet = (payload) => {
  superagent.get.mockImplementation(() => superagent.makeRequest(payload));
};

const mockPost = (payload) => {
  superagent.post.mockImplementation(() => superagent.makeRequest(payload));
};

beforeAll(async () => {
  config.settings = {
    ...config.settings,
    publicURL: PUBLIC_URL,
    apiPath: API_PATH,
    internalApiPath: INTERNAL_API_PATH,
    defaultPageSize: 25,
  };

  const app = express();
  app.use((req, res, next) => {
    req.universalCookies = { get: () => req.headers['x-auth-token'] };
    next();
  });
  app.use(makeMiddlewares());

  server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  base = `http://127.0.0.1:${server.address().port}`;
});

afterAll(() => new Promise((resolve) => server.close(resolve)));

beforeEach(() => {
  jest.resetAllMocks();
  config.settings.internalApiPath = INTERNAL_API_PATH;
});

describe('rss middleware', () => {
  it('serves the feed of the listing block from the API', async () => {
    mockGet({ body: content() });
    mockPost({ body: { items: [item()] } });

    const response = await get('/en/newsroom/rss.xml');

    expect(response.status).toBe(200);
    expect(response.type).toContain('application/atom+xml');
    expect(response.body).toContain('<![CDATA[Newsroom]]>');
    expect(response.body).toContain('<![CDATA[First item]]>');
    expect(response.body).toContain(
      `<link>${PUBLIC_URL}/en/newsroom/news/first</link>`,
    );
    expect(response.body).toContain(
      `<atom:link href="${PUBLIC_URL}/en/newsroom/rss.xml" rel="self"`,
    );
  });

  it('reads the parent content and the search from the API path', async () => {
    mockGet({ body: content() });
    mockPost({ body: { items: [item()] } });

    await get('/en/newsroom/rss.xml');

    expect(superagent.get.mock.calls[0][0]).toBe(
      `${INTERNAL_API_PATH}/++api++/en/newsroom`,
    );
    expect(superagent.post.mock.calls[0][0]).toBe(
      `${INTERNAL_API_PATH}/++api++/@querystring-search`,
    );
  });

  it('forwards the auth token of the request', async () => {
    mockGet({ body: content() });
    mockPost({ body: { items: [item()] } });

    await get('/en/newsroom/rss.xml', { 'x-auth-token': 'secret' });

    expect(superagent.get.mock.results[0].value.headers).toEqual({
      Authorization: 'Bearer secret',
    });
    expect(superagent.post.mock.results[0].value.headers).toEqual({
      Authorization: 'Bearer secret',
    });
  });

  it('forwards the query of the listing block', async () => {
    mockGet({ body: content() });
    mockPost({ body: { items: [item()] } });

    await get('/en/newsroom/rss.xml');

    const sent = superagent.post.mock.results[0].value.sent;
    expect(sent.query).toEqual([
      {
        i: 'portal_type',
        o: 'plone.app.querystring.operation.selection.any',
        v: ['News Item'],
      },
    ]);
    expect(sent.b_size).toBe('3');
    expect(sent.metadata_fields).toBe('_all');
    expect(sent.b_start).toBe(0);
  });

  it('answers 404 when the content has no listing block', async () => {
    mockGet({
      body: content({
        blocks: { title: { '@type': 'title' } },
        blocks_layout: { items: ['title'] },
      }),
    });

    const response = await get('/rss.xml');

    expect(response.status).toBe(404);
    expect(JSON.parse(response.body).error).toBe('Not Found');
    expect(superagent.post).not.toHaveBeenCalled();
  });

  it('answers 404 when the listing block has no query', async () => {
    mockGet({
      body: content({
        blocks: { listing: { '@type': 'listing', querystring: {} } },
        blocks_layout: { items: ['listing'] },
      }),
    });

    const response = await get('/en/rss.xml');

    expect(response.status).toBe(404);
    expect(superagent.post).not.toHaveBeenCalled();
  });

  it('answers 404 when the API answers with HTML instead of JSON', async () => {
    mockGet({ body: '<!doctype html><html></html>' });

    const response = await get('/en/rss.xml');

    expect(response.status).toBe(404);
    expect(superagent.post).not.toHaveBeenCalled();
  });

  it('answers 404 when the parent content does not exist', async () => {
    mockGet({ error: { response: { status: 404 } } });

    const response = await get('/en/highlights/rss.xml');

    expect(response.status).toBe(404);
  });

  it('answers 401 when the API refuses the request', async () => {
    mockGet({ error: { response: { status: 401 } } });

    const response = await get('/en/private/rss.xml');

    expect(response.status).toBe(401);
    expect(JSON.parse(response.body).error).toBe('Unauthorized');
  });

  it('answers 500 for any other API error', async () => {
    mockGet({ error: { response: { status: 400 } } });

    const response = await get('/en/broken/rss.xml');

    expect(response.status).toBe(500);
    expect(JSON.parse(response.body).error).toBe('Internal Server Error');
  });

  it('uses the listing block from the layout, not an orphan block', async () => {
    mockGet({
      body: content({
        blocks: {
          orphan: listing({ querystring: { query: [{ i: 'UID', v: ['x'] }] } }),
          listing: listing({
            querystring: {
              query: [{ i: 'portal_type', v: ['News Item'] }],
              b_size: '9',
            },
          }),
        },
        blocks_layout: { items: ['listing'] },
      }),
    });
    mockPost({ body: { items: [item()] } });

    const response = await get('/en/rss.xml');

    expect(response.status).toBe(200);
    expect(superagent.post.mock.results[0].value.sent.b_size).toBe('9');
  });

  it('finds a listing block nested in a container block', async () => {
    mockGet({
      body: content({
        blocks: {
          group: {
            '@type': 'group',
            blocks: { listing: listing() },
            blocks_layout: { items: ['listing'] },
          },
        },
        blocks_layout: { items: ['group'] },
      }),
    });
    mockPost({ body: { items: [item()] } });

    const response = await get('/en/rss.xml');

    expect(response.status).toBe(200);
    expect(superagent.post).toHaveBeenCalled();
  });

  it('serves a feed for items without description and a content without title', async () => {
    mockGet({ body: content({ title: undefined }) });
    mockPost({
      body: {
        items: [
          item({ description: undefined, Subject: undefined }),
          item({ title: undefined, getURL: undefined }),
        ],
      },
    });

    const response = await get('/en/newsroom/rss.xml');

    expect(response.status).toBe(200);
    expect(response.body).toContain('<![CDATA[Untitled RSS Feed]]>');
  });

  it('falls back to the app API path when there is no internal one', async () => {
    config.settings.internalApiPath = undefined;
    mockGet({ body: content() });
    mockPost({ body: { items: [item()] } });

    await get('/en/newsroom/rss.xml');

    expect(superagent.get.mock.calls[0][0]).toBe(
      `${API_PATH}/++api++/en/newsroom`,
    );
  });
});
