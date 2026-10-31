import { readItems } from '@directus/sdk';
import getDirectusInstance, { cachedFetch, describe } from '#lib/directus.js';

/** Fields that hold a file: GraphQL returns the file as an object, REST as its id. */
const FILES = new Set(['image', 'featured_image']);

/**
 * @typedef {{ collection: string, fields: string[], sort?: string | string[], limit?: number,
 *   filter?: object, required?: boolean }} Spec
 */

/**
 * A value as GraphQL source (object keys unquoted). Directus rejects a typed filter variable with an
 * internal error, so filters go into the query itself.
 * @param {any} value
 * @returns {string}
 */
const literal = (value) =>
	Array.isArray(value)
		? `[${value.map(literal).join(', ')}]`
		: value && typeof value === 'object'
			? `{${Object.entries(value)
					.map(([k, v]) => `${k}: ${literal(v)}`)
					.join(', ')}}`
			: JSON.stringify(value);

/** @param {string[]} fields */
const selection = (fields) => fields.map((f) => (FILES.has(f) ? `${f} { id }` : f)).join(' ');

/** @param {any[]} rows @param {string[]} fields */
const unwrap = (rows, fields) =>
	rows.map((row) => {
		for (const f of fields)
			if (FILES.has(f) && row[f] && typeof row[f] === 'object') row[f] = row[f].id;
		return row;
	});

/**
 * Several collections in one trip to the CMS. Each spec is read the way readItems would read it, and
 * its rows come back under the spec's key. If the combined query fails (a field renamed, a collection
 * made private), each collection is asked for on its own, so one broken section leaves only itself
 * empty; a spec marked `required` fails the page instead.
 * @param {typeof globalThis.fetch} fetch
 * @param {Record<string, Spec>} specs
 * @returns {Promise<Record<string, any[]>>}
 */
export async function collections(fetch, specs) {
	const entries = Object.entries(specs);
	const parts = entries.map(([key, s]) => {
		const args = [];
		if (s.sort) args.push(`sort: ${JSON.stringify([].concat(/** @type {any} */ (s.sort)))}`);
		if (s.limit) args.push(`limit: ${s.limit}`);
		if (s.filter) args.push(`filter: ${literal(s.filter)}`);
		return `${key}: ${s.collection}${args.length ? `(${args.join(', ')})` : ''} { ${selection(s.fields)} }`;
	});
	const query = `{ ${parts.join(' ')} }`;

	try {
		const res = await cachedFetch(fetch)('https://cms.alexwang.net/graphql', {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({ query })
		});
		const body = await res.json();
		if (!res.ok || body.errors || !body.data)
			throw new Error(body.errors?.[0]?.message ?? res.status);
		return Object.fromEntries(
			entries.map(([key, s]) => [key, unwrap(body.data[key] ?? [], s.fields)])
		);
	} catch (err) {
		console.error(`Directus combined query failed, asking one by one: ${describe(err)}`);
	}

	const directus = getDirectusInstance(fetch);
	const rows = await Promise.all(
		entries.map(([key, s]) =>
			directus
				.request(
					readItems(/** @type {any} */ (s.collection), {
						fields: /** @type {any} */ (s.fields),
						...(s.sort ? { sort: /** @type {any} */ (s.sort) } : {}),
						...(s.limit ? { limit: s.limit } : {}),
						...(s.filter ? { filter: /** @type {any} */ (s.filter) } : {})
					})
				)
				.catch((/** @type {unknown} */ err) => {
					if (s.required) throw err;
					console.error(`Directus ${key} unavailable: ${describe(err)}`);
					return [];
				})
		)
	);
	return Object.fromEntries(entries.map(([key], i) => [key, rows[i]]));
}
