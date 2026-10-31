import { createDirectus, rest } from '@directus/sdk';

const ORIGIN = 'https://cms.alexwang.net';

/** How long a CMS answer is reused, in seconds. Edits show up within this long. */
const TTL = 60;

/** Answers already fetched by this server instance, newest per request. */
const memory = new Map();
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
		const fresh = memory.get(key);
		if (fresh && now - fresh.at < TTL * 1000) return reply(fresh);

		const edge = /** @type {Cache | undefined} */ (/** @type {any} */ (globalThis.caches)?.default);
		const stored = await edge?.match(key).catch(() => undefined);
		if (stored) {
			const entry = { at: now, status: stored.status, text: await stored.text() };
			memory.set(key, entry);
			return reply(entry);
		}

		let trip = flying.get(key);
		if (!trip) {
			trip = (async () => {
				const res = await fetch(input, init);
				const text = await res.text();
				const entry = { at: Date.now(), status: res.status, text };
				if (res.ok) {
					memory.set(key, entry);
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
