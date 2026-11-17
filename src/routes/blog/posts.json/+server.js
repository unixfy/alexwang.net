import getDirectusInstance, { edgeCached } from '#lib/directus.js';
import { json } from '@sveltejs/kit';
import { listPosts, pageOf, scopeFilter } from '#lib/blog.js';

// The next page of an archive, for the infinite scroll: same scope, same order, as cards. Each page
// is kept at the edge for as long as its cache-control says, so scrolling readers share one build.
export function GET({ fetch, url }) {
	return edgeCached(url.href, () => build(fetch, url));
}

/** @param {typeof globalThis.fetch} fetch @param {URL} url */
async function build(fetch, url) {
	const q = url.searchParams.get('q')?.trim().slice(0, 100);
	const result = await listPosts(getDirectusInstance(fetch), {
		page: pageOf(url),
		filter: scopeFilter({
			category: url.searchParams.get('category'),
			tag: url.searchParams.get('tag')
		}),
		...(q ? { search: q } : {})
	});
	return json(result, { headers: { 'cache-control': 'public, max-age=60' } });
}
