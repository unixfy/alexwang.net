/// <reference lib="webworker" />
import { immutable, assets } from '$app/manifest';
import { version } from '$app/env';

const sw = /** @type {ServiceWorkerGlobalScope} */ (/** @type {unknown} */ (self));

const CACHE = `cache-${version}`;
const ASSETS = [...immutable, ...assets].map((asset) => `/${asset.path}`);

sw.addEventListener('install', (event) => {
	event.waitUntil(
		caches
			.open(CACHE)
			.then((cache) => cache.addAll(ASSETS))
			.then(() => sw.skipWaiting())
	);
});

sw.addEventListener('activate', (event) => {
	event.waitUntil(
		caches
			.keys()
			.then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
			.then(() => sw.clients.claim())
	);
});

sw.addEventListener('fetch', (event) => {
	const { request } = event;
	if (request.method !== 'GET') return;

	const url = new URL(request.url);
	if (url.origin !== sw.location.origin) return;

	event.respondWith(
		(async () => {
			const cache = await caches.open(CACHE);

			// Built and static assets are immutable per version: serve from cache.
			if (ASSETS.includes(url.pathname)) {
				const cached = await cache.match(url.pathname);
				if (cached) return cached;
			}

			// Everything else (pages, data): network first, the cached copy when offline.
			try {
				const response = await fetch(request);
				if (response.status === 200) cache.put(request, response.clone());
				return response;
			} catch (err) {
				const cached = await cache.match(request);
				if (cached) return cached;
				throw err;
			}
		})()
	);
});
