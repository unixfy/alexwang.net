import getDirectusInstance from '#lib/directus.js';
import { json } from '@sveltejs/kit';
import { listPosts, pageOf, scopeFilter } from '#lib/blog.js';

// The next page of an archive, for the infinite scroll: same scope, same order, as cards.
export async function GET({ fetch, url }) {
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
