import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

/** @type {typeof import('#lib/directus.js')} */
let mod;

/** A Cache API stand-in, as Cloudflare exposes it at caches.default. */
function fakeEdge() {
	const store = new Map();
	return {
		store,
		match: vi.fn(async (/** @type {string} */ key) => store.get(key)?.clone()),
		put: vi.fn(async (/** @type {string} */ key, /** @type {Response} */ res) => {
			store.set(key, res);
		})
	};
}

const okJson = (/** @type {any} */ body, status = 200) =>
	new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

beforeEach(async () => {
	vi.resetModules();
	vi.stubEnv('DEV', false);
	mod = await import('#lib/directus.js');
});

afterEach(() => {
	vi.useRealTimers();
});

describe('describe', () => {
	test('joins the messages of an SDK error', () => {
		expect(mod.describe({ errors: [{ message: 'a' }, { message: 'b' }], response: {} })).toBe(
			'a; b'
		);
		expect(mod.describe({ errors: ['plain', null] })).toBe('plain; ');
	});
	test('uses an Error message or the value as text', () => {
		expect(mod.describe(new Error('boom'))).toBe('boom');
		expect(mod.describe('text')).toBe('text');
		expect(mod.describe(undefined)).toBe('undefined');
		expect(mod.describe({ errors: 'not an array' })).toBe('[object Object]');
	});
});

describe('cachedFetch', () => {
	test('in development it is the fetch it was given', async () => {
		vi.stubEnv('DEV', true);
		const f = vi.fn();
		expect(mod.cachedFetch(/** @type {any} */ (f))).toBe(f);
	});

	test('requests to other origins and writes pass straight through', async () => {
		const f = vi.fn(async () => okJson({}));
		const cf = mod.cachedFetch(/** @type {any} */ (f));
		await cf('https://example.com/x');
		await cf('https://example.com/x');
		await cf('https://cms.alexwang.net/items/comments', { method: 'POST', body: '{}' });
		await cf('https://cms.alexwang.net/items/comments', { method: 'PATCH', body: '{}' });
		expect(f).toHaveBeenCalledTimes(4);
	});

	test('a GET is answered from memory within the TTL, and fetched again after it', async () => {
		// lru-cache keeps the real `performance` it found when it loaded, so its clock is moved there
		let now = performance.now();
		vi.spyOn(performance, 'now').mockImplementation(() => now);
		const f = vi.fn(async () => okJson({ data: [1] }));
		const cf = mod.cachedFetch(/** @type {any} */ (f));
		const url = 'https://cms.alexwang.net/items/posts?limit=1';
		const a = await cf(url);
		const b = await cf(url);
		expect(await a.json()).toEqual({ data: [1] });
		expect(await b.json()).toEqual({ data: [1] });
		expect(b.headers.get('content-type')).toBe('application/json');
		expect(f).toHaveBeenCalledTimes(1);
		now += 59_000;
		// lru-cache reuses a reading of the clock for 1 ms
		await new Promise((r) => setTimeout(r, 5));
		await cf(url);
		expect(f).toHaveBeenCalledTimes(1);
		now += 2_000;
		await new Promise((r) => setTimeout(r, 5));
		await cf(url);
		expect(f).toHaveBeenCalledTimes(2);
	});

	test('a Request object is keyed by its URL', async () => {
		const f = vi.fn(async () => okJson({ ok: 1 }));
		const cf = mod.cachedFetch(/** @type {any} */ (f));
		await cf(new Request('https://cms.alexwang.net/items/a'));
		await cf('https://cms.alexwang.net/items/a');
		expect(f).toHaveBeenCalledTimes(1);
	});

	test('GraphQL POSTs are cached by the hash of their body', async () => {
		const f = vi.fn(async (_u, /** @type {any} */ init) => okJson({ q: init.body }));
		const cf = mod.cachedFetch(/** @type {any} */ (f));
		const url = 'https://cms.alexwang.net/graphql';
		await cf(url, { method: 'post', body: '{"query":"a"}' });
		const again = await cf(url, { method: 'POST', body: '{"query":"a"}' });
		await cf(url, { method: 'POST', body: '{"query":"b"}' });
		expect(f).toHaveBeenCalledTimes(2);
		expect(await again.json()).toEqual({ q: '{"query":"a"}' });
	});

	test('failures are passed on but never kept', async () => {
		const f = vi.fn(async () => okJson({ errors: [] }, 503));
		const edge = fakeEdge();
		vi.stubGlobal('caches', { default: edge });
		const cf = mod.cachedFetch(/** @type {any} */ (f));
		const res = await cf('https://cms.alexwang.net/items/x');
		expect(res.status).toBe(503);
		await cf('https://cms.alexwang.net/items/x');
		expect(f).toHaveBeenCalledTimes(2);
		expect(edge.put).not.toHaveBeenCalled();
	});

	test('concurrent requests for the same thing share one trip', async () => {
		/** @type {(r: Response) => void} */
		let release = () => {};
		const f = vi.fn(() => new Promise((r) => (release = r)));
		const cf = mod.cachedFetch(/** @type {any} */ (f));
		const url = 'https://cms.alexwang.net/items/slow';
		const both = Promise.all([cf(url), cf(url)]);
		await vi.waitFor(() => expect(f).toHaveBeenCalled());
		release(okJson({ v: 1 }));
		const [a, b] = await both;
		expect(await a.json()).toEqual({ v: 1 });
		expect(await b.json()).toEqual({ v: 1 });
		expect(f).toHaveBeenCalledTimes(1);
	});

	test('answers go to the edge cache with a max-age, and come back from it', async () => {
		const edge = fakeEdge();
		vi.stubGlobal('caches', { default: edge });
		const f = vi.fn(async () => okJson({ v: 'net' }));
		const url = 'https://cms.alexwang.net/items/e';
		await mod.cachedFetch(/** @type {any} */ (f))(url);
		const stored = edge.store.get(url);
		expect(stored.headers.get('cache-control')).toBe('public, max-age=60');

		// another instance (fresh memory) reads it from the edge
		vi.resetModules();
		const other = await import('#lib/directus.js');
		const g = vi.fn();
		const cf = other.cachedFetch(/** @type {any} */ (g));
		const res = await cf(url);
		expect(await res.json()).toEqual({ v: 'net' });
		// and then from its own memory
		await cf(url);
		expect(edge.match).toHaveBeenCalledTimes(2);
		expect(g).not.toHaveBeenCalled();
	});

	test('searches are left to the edge cache, not kept in memory', async () => {
		const edge = fakeEdge();
		vi.stubGlobal('caches', { default: edge });
		const f = vi.fn(async () => okJson({ v: 1 }));
		const cf = mod.cachedFetch(/** @type {any} */ (f));
		const url = 'https://cms.alexwang.net/items/posts?search=train';
		await cf(url);
		await cf(url);
		// the second answer came from the edge, not memory and not the network
		expect(f).toHaveBeenCalledTimes(1);
		expect(edge.match).toHaveBeenCalledTimes(2);
		await cf('https://cms.alexwang.net/items/posts?a=1&search=x');
		await cf('https://cms.alexwang.net/items/posts?a=1&search=x');
		expect(edge.match).toHaveBeenCalledTimes(4);
	});

	test('a broken edge cache is ignored', async () => {
		vi.stubGlobal('caches', {
			default: {
				match: vi.fn(async () => {
					throw new Error('match');
				}),
				put: vi.fn(async () => {
					throw new Error('put');
				})
			}
		});
		const f = vi.fn(async () => okJson({ v: 1 }));
		const res = await mod.cachedFetch(/** @type {any} */ (f))('https://cms.alexwang.net/items/b');
		expect(await res.json()).toEqual({ v: 1 });
	});

	test('memory holds at most 200 answers, dropping the oldest', async () => {
		const f = vi.fn(async () => okJson({}));
		const cf = mod.cachedFetch(/** @type {any} */ (f));
		for (let i = 0; i <= 200; i++) await cf(`https://cms.alexwang.net/items/n${i}`);
		expect(f).toHaveBeenCalledTimes(201);
		await cf('https://cms.alexwang.net/items/n200');
		expect(f).toHaveBeenCalledTimes(201);
		await cf('https://cms.alexwang.net/items/n0');
		expect(f).toHaveBeenCalledTimes(202);
	});
});

describe('edgeCached', () => {
	const page = () => new Response('<xml/>', { headers: { 'cache-control': 'max-age=9' } });

	test('without an edge cache the page is built every time', async () => {
		const make = vi.fn(async () => page());
		await mod.edgeCached('k', make);
		await mod.edgeCached('k', make);
		expect(make).toHaveBeenCalledTimes(2);
	});

	test('in development the edge cache is not used', async () => {
		vi.stubEnv('DEV', true);
		const edge = fakeEdge();
		vi.stubGlobal('caches', { default: edge });
		await mod.edgeCached('k', async () => page());
		expect(edge.match).not.toHaveBeenCalled();
		expect(edge.put).not.toHaveBeenCalled();
	});

	test('a built page is stored, and later served as a mutable copy', async () => {
		const edge = fakeEdge();
		vi.stubGlobal('caches', { default: edge });
		const make = vi.fn(async () => page());
		const first = await mod.edgeCached('https://alexwang.net/feed', make);
		expect(await first.text()).toBe('<xml/>');
		const second = await mod.edgeCached('https://alexwang.net/feed', make);
		expect(make).toHaveBeenCalledTimes(1);
		expect(await second.text()).toBe('<xml/>');
		second.headers.set('x-added', '1');
		expect(second.headers.get('cache-control')).toBe('max-age=9');
	});

	test('only successful pages are stored, and cache errors are ignored', async () => {
		const edge = fakeEdge();
		vi.stubGlobal('caches', { default: edge });
		await mod.edgeCached('k', async () => new Response('', { status: 500 }));
		expect(edge.put).not.toHaveBeenCalled();

		edge.match.mockRejectedValueOnce(new Error('x'));
		edge.put.mockRejectedValueOnce(new Error('y'));
		const res = await mod.edgeCached('k2', async () => page());
		expect(res.status).toBe(200);
	});
});

describe('getDirectusInstance', () => {
	test('uses the cached fetch it is given', async () => {
		const f = vi.fn(async () => okJson({ data: [{ slug: 'a' }] }));
		const directus = mod.default(/** @type {any} */ (f));
		const { readItems } = await import('@directus/sdk');
		expect(await directus.request(readItems('posts', { fields: ['slug'] }))).toEqual([
			{ slug: 'a' }
		]);
		expect(f).toHaveBeenCalledOnce();
	});

	test('works without a fetch', () => {
		expect(mod.default().url.href).toBe('https://cms.alexwang.net/');
	});
});
