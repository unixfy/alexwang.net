import getDirectusInstance from '#lib/directus.js';
import { readItems } from '@directus/sdk';
import { error } from '@sveltejs/kit';
import { archive } from '#lib/blog.js';

export async function load({ fetch, params, url }) {
	const directus = getDirectusInstance(fetch);
	const [found, data] = await Promise.all([
		directus.request(
			readItems('tags', {
				fields: ['name', 'slug', 'description'],
				filter: { slug: { _eq: params.slug } },
				limit: 1
			})
		),
		archive(directus, url, {
			filter: { tags: { tags_id: { slug: { _eq: params.slug } } } }
		})
	]);
	if (found.length === 0) error(404, 'Tag not found');

	return {
		...data,
		tag: found[0],
		title: data.page > 1 ? `${found[0].name}, page ${data.page}` : found[0].name,
		description: found[0].description || `Posts tagged “${found[0].name}”.`
	};
}
