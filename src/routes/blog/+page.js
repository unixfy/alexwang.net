import getDirectusInstance from '#lib/directus.js';
import { readItems } from '@directus/sdk';
import { archive } from '#lib/blog.js';

export async function load({ fetch, url }) {
	const directus = getDirectusInstance(fetch);
	const q = url.searchParams.get('q')?.trim() ?? '';
	const [data, tags] = await Promise.all([
		archive(fetch, directus, url, q ? { q } : {}),
		directus
			.request(readItems('tags', { fields: ['name', 'slug'], sort: 'name', limit: -1 }))
			.catch(() => [])
	]);
	return {
		...data,
		tags,
		q,
		title: q ? `Search: ${q}` : data.page > 1 ? `Blog, page ${data.page}` : 'Blog',
		description: 'Writing by Alex Wang on technology, servers, transportation and travel.',
		robots: q ? 'noindex, follow' : undefined
	};
}
