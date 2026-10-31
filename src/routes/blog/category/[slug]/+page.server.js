import { error } from '@sveltejs/kit';
import { archive } from '#lib/blog.js';

export async function load({ fetch, params, url }) {
	const { found, ...data } = await archive(
		fetch,
		url,
		{ category: params.slug },
		{
			found: {
				collection: 'categories',
				fields: ['name', 'slug', 'description'],
				filter: { slug: { _eq: params.slug } },
				limit: 1
			}
		}
	);
	if (!found?.length) error(404, 'Category not found');

	return {
		...data,
		category: found[0],
		title: data.page > 1 ? `${found[0].name}, page ${data.page}` : found[0].name,
		description: found[0].description || `Posts filed under ${found[0].name}.`
	};
}
