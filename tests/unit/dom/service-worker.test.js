import { beforeEach, describe, expect, test, vi } from 'vitest';

vi.mock('$app/manifest', () => ({
	immutable: [{ path: '_app/immutable/a.js' }],
	assets: [{ path: 'favicon.png' }]
}));
vi.mock('$app/env', () => ({ version: 'v1', browser: true, dev: false, building: false }));

/** A service worker global: listeners are kept so events can be dispatched by hand. */
function fakeSelf() {
	/** @type {Record<string, (e: any) => void>} */
	const on = {};
	return {
		on,
		location: { origin: 'https://alexwang.net' },
		skipWaiting: vi.fn(async () => {}),
		clients: { claim: vi.fn(async () => {}) },
		addEventListener: (/** @type {string} */ type, /** @type {(e: any) => void} */ fn) =>
			(on[type] = fn)
	};
}

/** A CacheStorage with real Response bodies. */
function fakeCaches() {
	/** @type {Map<string, Map<string, Response>>} */
	const stores = new Map();
	const open = async (/** @type {string} */ name) => {
		if (!stores.has(name)) stores.set(name, new Map());
		const store = /** @type {Map<string, Response>} */ (stores.get(name));
		const key = (/** @type {any} */ r) => (typeof r === 'string' ? r : new URL(r.url).pathname);
		return {
			addAll: vi.fn(async (/** @type {string[]} */ urls) =>
				urls.forEach((u) => store.set(u, new Response(`cached ${u}`)))
			),
			match: vi.fn(async (/** @type {any} */ r) => store.get(key(r))?.clone()),
			put: vi.fn(async (/** @type {any} */ r, /** @type {Response} */ res) =>
				store.set(key(r), res)
			)
		};
	};
	return {
		stores,
		open: vi.fn(open),
		keys: vi.fn(async () => [...stores.keys()]),
		delete: vi.fn(async (/** @type {string} */ name) => stores.delete(name))
	};
}

/** @type {ReturnType<typeof fakeSelf>} */
let sw;
/** @type {ReturnType<typeof fakeCaches>} */
let caches;

beforeEach(async () => {
	sw = fakeSelf();
	caches = fakeCaches();
	vi.stubGlobal('self', sw);
	vi.stubGlobal('caches', caches);
	vi.resetModules();
	await import('../../../src/service-worker.js');
});

/** Dispatch an extendable event and wait for what it was extended with. */
async function extend(/** @type {string} */ type) {
	/** @type {Promise<any> | undefined} */
	let work;
	sw.on[type]({ waitUntil: (/** @type {Promise<any>} */ p) => (work = p) });
	await work;
}

/** Dispatch a fetch; returns the response, or undefined when the worker let it through. */
async function request(/** @type {string} */ url, method = 'GET') {
	/** @type {Promise<Response> | undefined} */
	let answer;
	sw.on.fetch({
		request: new Request(url, { method }),
		respondWith: (/** @type {Promise<Response>} */ p) => (answer = p)
	});
	return answer;
}

describe('service worker', () => {
	test('install caches the build and static assets, then takes over', async () => {
		await extend('install');
		expect([...(caches.stores.get('cache-v1')?.keys() ?? [])]).toEqual([
			'/_app/immutable/a.js',
			'/favicon.png'
		]);
		expect(sw.skipWaiting).toHaveBeenCalled();
	});

	test('activate deletes caches from older versions', async () => {
		await caches.open('cache-v0');
		await caches.open('cache-v1');
		await extend('activate');
		expect([...caches.stores.keys()]).toEqual(['cache-v1']);
		expect(sw.clients.claim).toHaveBeenCalled();
	});

	test('other origins and non-GET requests are left alone', async () => {
		expect(await request('https://cdn.example.com/x.js')).toBeUndefined();
		expect(await request('https://alexwang.net/blog/x', 'POST')).toBeUndefined();
	});

	test('built assets come from the cache, or the network when not yet cached', async () => {
		await extend('install');
		const fetch = vi.fn(async () => new Response('net'));
		vi.stubGlobal('fetch', fetch);
		expect(await (await request('https://alexwang.net/favicon.png'))?.text()).toBe(
			'cached /favicon.png'
		);
		expect(fetch).not.toHaveBeenCalled();
		caches.stores.get('cache-v1')?.delete('/favicon.png');
		expect(await (await request('https://alexwang.net/favicon.png'))?.text()).toBe('net');
	});

	test('pages are network first, kept when OK, and served from the cache when offline', async () => {
		vi.stubGlobal(
			'fetch',
			vi.fn(async () => new Response('page v2'))
		);
		expect(await (await request('https://alexwang.net/blog'))?.text()).toBe('page v2');
		await vi.waitFor(() => expect(caches.stores.get('cache-v1')?.has('/blog')).toBe(true));

		vi.stubGlobal(
			'fetch',
			vi.fn(async () => new Response('gone', { status: 404 }))
		);
		expect((await request('https://alexwang.net/missing'))?.status).toBe(404);
		expect(caches.stores.get('cache-v1')?.has('/missing')).toBe(false);

		vi.stubGlobal(
			'fetch',
			vi.fn(async () => Promise.reject(new TypeError('offline')))
		);
		expect(await (await request('https://alexwang.net/blog'))?.text()).toBe('page v2');
		await expect(request('https://alexwang.net/never-seen')).rejects.toThrow('offline');
	});
});
