// A fake Directus (https://cms.alexwang.net) answering the REST and GraphQL requests the site makes,
// from fixture rows held in memory. It is a `fetch`, so it can be handed to load functions, to the
// SDK, or installed as globalThis.fetch for a built server.

export const CMS = 'https://cms.alexwang.net';

/**
 * @typedef {{
 *   collections?: Record<string, any[]>,
 *   singletons?: Record<string, any>,
 *   fail?: Set<string>,
 *   graphql?: boolean,
 *   turnstile?: any,
 *   created?: any[],
 *   calls?: { method: string, url: string, body?: string }[]
 * }} FakeState
 */

/** Rows whose `slug` equals the `_eq` (or differs from the `_neq`) found anywhere in a filter. */
function bySlug(/** @type {any[]} */ rows, /** @type {any} */ filter) {
	const eq = find(filter, 'slug', '_eq');
	const neq = find(filter, 'slug', '_neq');
	return rows.filter(
		(r) => (eq === undefined || r.slug === eq) && (neq === undefined || r.slug !== neq)
	);
}

/** The first `{ [field]: { [op]: value } }` anywhere in a filter, ignoring relational paths. */
function find(/** @type {any} */ node, /** @type {string} */ field, /** @type {string} */ op) {
	if (!node || typeof node !== 'object') return undefined;
	if (Array.isArray(node)) {
		for (const n of node) {
			const v = find(n, field, op);
			if (v !== undefined) return v;
		}
		return undefined;
	}
	for (const [k, v] of Object.entries(node)) {
		if (k === field && v && typeof v === 'object' && op in v) return v[op];
		if (k === '_and' || k === '_or') {
			const found = find(v, field, op);
			if (found !== undefined) return found;
		}
	}
	return undefined;
}

const json = (/** @type {any} */ body, status = 200) =>
	new Response(JSON.stringify(body), {
		status,
		headers: { 'content-type': 'application/json' }
	});

/**
 * @param {FakeState} [state]
 * @returns {typeof globalThis.fetch & { state: Required<FakeState> }}
 */
export function fakeCms(state = {}) {
	const s = /** @type {Required<FakeState>} */ ({
		collections: {},
		singletons: {},
		fail: new Set(),
		graphql: true,
		turnstile: { success: true },
		created: [],
		calls: [],
		...state
	});

	/** @type {any} */
	const fetch = async (/** @type {any} */ input, /** @type {any} */ init = {}) => {
		const req = input instanceof Request ? input : null;
		const url = new URL(req ? req.url : String(input));
		const method = (init.method ?? req?.method ?? 'GET').toUpperCase();
		const body = init.body ?? (req && method !== 'GET' ? await req.text() : undefined);
		s.calls.push({
			method,
			url: url.href,
			body: typeof body === 'string' || body instanceof URLSearchParams ? String(body) : undefined
		});

		if (url.href.startsWith('https://challenges.cloudflare.com/')) {
			if (s.turnstile instanceof Error) throw s.turnstile;
			return json(s.turnstile);
		}
		if (url.origin !== CMS) return new Response('not found', { status: 404 });

		if (url.pathname === '/graphql' && method === 'POST') {
			if (!s.graphql) return json({ errors: [{ message: 'GraphQL disabled' }] }, 400);
			const { query } = JSON.parse(String(body));
			/** @type {Record<string, any[]>} */
			const data = {};
			for (const m of query.matchAll(/(\w+): ([a-z_]+)(\((.*?)\))? \{/g)) {
				const [, alias, collection, , args = ''] = m;
				if (s.fail.has(collection)) return json({ errors: [{ message: `${collection} broke` }] });
				const slug = /slug: \{_eq: "([^"]*)"\}/.exec(args)?.[1];
				const limit = Number(/limit: (-?\d+)/.exec(args)?.[1] ?? -1);
				let rows = (s.collections[collection] ?? []).filter((r) => !slug || r.slug === slug);
				if (limit > 0) rows = rows.slice(0, limit);
				// GraphQL returns file fields as objects
				data[alias] = rows.map((r) => ({
					...r,
					...(r.image ? { image: { id: r.image } } : {}),
					...(r.featured_image ? { featured_image: { id: r.featured_image } } : {})
				}));
			}
			return json({ data });
		}

		const single = /^\/items\/([a-z_]+)$/.exec(url.pathname)?.[1];
		if (!single) return json({ errors: [{ message: 'Route not found' }] }, 404);

		if (method === 'POST') {
			if (s.fail.has(`create:${single}`)) return json({ errors: [{ message: 'nope' }] }, 403);
			const item = JSON.parse(String(body));
			s.created.push({ collection: single, item });
			return json({ data: { id: s.created.length, ...item } });
		}

		if (s.fail.has(single)) return json({ errors: [{ message: `${single} is unavailable` }] }, 503);
		if (single in s.singletons) return json({ data: s.singletons[single] });

		const filter = url.searchParams.get('filter');
		let rows = bySlug(s.collections[single] ?? [], filter ? JSON.parse(filter) : null);
		// a post's neighbours: dated on or before / on or after it ($NOW is the visibility rule)
		const and = filter ? (JSON.parse(filter)._and ?? []) : [];
		for (const f of and) {
			const before = f?.date_published?._lte;
			const after = f?.date_published?._gte;
			if (before) rows = rows.filter((r) => (r.date_published ?? '') <= before);
			if (after) rows = rows.filter((r) => (r.date_published ?? '') >= after);
		}
		const parentId = filter && find(JSON.parse(filter), 'id', '_eq');
		if (parentId != null) rows = rows.filter((r) => String(r.id) === String(parentId));
		const search = url.searchParams.get('search');
		if (search) rows = rows.filter((r) => JSON.stringify(r).includes(search));
		const sort = url.searchParams.get('sort');
		if (sort === '-date_published')
			rows = [...rows].sort((a, b) =>
				(b.date_published ?? '').localeCompare(a.date_published ?? '')
			);
		if (sort === 'date_published')
			rows = [...rows].sort((a, b) =>
				(a.date_published ?? '').localeCompare(b.date_published ?? '')
			);
		const offset = Number(url.searchParams.get('offset') ?? 0);
		const limit = Number(url.searchParams.get('limit') ?? -1);
		rows = rows.slice(offset, limit > 0 ? offset + limit : undefined);
		return json({ data: rows });
	};
	fetch.state = s;
	return fetch;
}
