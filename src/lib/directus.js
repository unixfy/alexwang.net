import { createDirectus, rest } from '@directus/sdk';

const ORIGIN = 'https://cms.alexwang.net';

/** How long a CMS answer is reused, in seconds. Edits show up within this long. */
const TTL = 60;

/** How many answers this server instance keeps in memory, oldest dropped first. */
const MEMORY_MAX = 200;

/** Answers already fetched by this server instance, newest per request. */
const memory = new Map();

/**
 * Keep an answer in memory. Expired answers are dropped first, then the oldest past MEMORY_MAX, so
 * an instance that lives for hours (and sees many different searches) doesn't grow without end;
 * a growing heap costs garbage collection time, which counts against the Worker's CPU limit.
 * @param {string} key
 * @param {{ at: number, status: number, text: string }} entry
 */
function remember(key, entry) {
	memory.delete(key);
	memory.set(key, entry);
	for (const [k, e] of memory) {
		if (memory.size <= MEMORY_MAX && entry.at - e.at < TTL * 1000) break;
		memory.delete(k);
	}
}

/** The edge's cache, shared by every instance in the data centre; absent in development. */
const edgeCache = () =>
	/** @type {Cache | undefined} */ (/** @type {any} */ (globalThis.caches)?.default);

/**
 * A whole response kept in the edge's cache under `key` (normally the request's URL) for as long as
 * its own cache-control allows, so expensive pages (the feed, the sitemap) are built once per data
 * centre rather than on every request. Only successful responses are kept.
 * @param {string} key
 * @param {() => Promise<Response>} make
 * @returns {Promise<Response>}
 */
export async function edgeCached(key, make) {
	const edge = import.meta.env.DEV ? undefined : edgeCache();
	const hit = await edge?.match(key).catch(() => undefined);
	// a copy, since a cached response's headers can't be changed and SvelteKit may add to them
	if (hit) return new Response(hit.body, hit);
	const res = await make();
	if (res.status === 200 && edge) await edge.put(key, res.clone()).catch(() => {});
	return res;
}
/** Requests on their way, so two pages asking for the same thing share one trip. */
const flying = new Map();

/** @param {string} text */
async function digest(text) {
	const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
	return [...new Uint8Array(bytes)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * The CMS sends `cache-control: no-cache`, so every page view would otherwise cost a round trip per
 * collection. Reads (GETs, and the POSTs that carry a GraphQL query) are kept for TTL seconds, in
 * memory and in the edge's own cache, which is shared by every instance in the data centre. Writes
 * and failures are never kept.
 * @param {typeof globalThis.fetch} fetch
 * @returns {typeof globalThis.fetch}
 */
export function cachedFetch(fetch) {
	if (import.meta.env.DEV) return fetch;

	return async (input, init) => {
		const url = String(input instanceof Request ? input.url : input);
		const method = (init?.method ?? 'GET').toUpperCase();
		const query = method === 'POST' && url.endsWith('/graphql');
		if ((method !== 'GET' && !query) || !url.startsWith(ORIGIN)) return fetch(input, init);

		const key = query ? `${url}?q=${await digest(String(init?.body))}` : url;
		const now = Date.now();
		// searches are many and rarely repeated: they are left to the edge's cache
		const keep = !/[?&]search=/.test(url);
		const fresh = memory.get(key);
		if (fresh && now - fresh.at < TTL * 1000) return reply(fresh);

		const edge = edgeCache();
		const stored = await edge?.match(key).catch(() => undefined);
		if (stored) {
			const entry = { at: now, status: stored.status, text: await stored.text() };
			if (keep) remember(key, entry);
			return reply(entry);
		}

		let trip = flying.get(key);
		if (!trip) {
			trip = (async () => {
				const res = await fetch(input, init);
				const text = await res.text();
				const entry = { at: Date.now(), status: res.status, text };
				if (res.ok) {
					if (keep) remember(key, entry);
					await edge
						?.put(
							key,
							new Response(text, {
								headers: {
									'content-type': 'application/json',
									'cache-control': `public, max-age=${TTL}`
								}
							})
						)
						.catch(() => {});
				}
				return entry;
			})().finally(() => flying.delete(key));
			flying.set(key, trip);
		}
		return reply(await trip);
	};
}

/** @param {{ status: number, text: string }} entry */
const reply = (entry) =>
	new Response(entry.text, {
		status: entry.status,
		headers: { 'content-type': 'application/json' }
	});

/** @param {typeof globalThis.fetch} [fetch] */
function getDirectusInstance(fetch) {
	const options = fetch ? { globals: { fetch: cachedFetch(fetch) } } : {};
	const directus = createDirectus(ORIGIN, options).with(rest());
	return directus;
}

/**
 * A readable line for a failed Directus call. The SDK's error carries the Response, and logging that
 * object throws (its body has already been read), which would turn a missing section into a 500.
 * @param {unknown} err
 */
export function describe(err) {
	if (err && typeof err === 'object' && 'errors' in err && Array.isArray(err.errors)) {
		return err.errors.map((/** @type {{ message?: string }} */ e) => e?.message ?? e).join('; ');
	}
	return err instanceof Error ? err.message : String(err);
}

export default getDirectusInstance;
