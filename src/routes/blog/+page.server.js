import { archive } from '#lib/blog.js';

export async function load({ fetch, url }) {
	const q = (url.searchParams.get('q') ?? '').trim().slice(0, 100);
	const data = await archive(fetch, url, q ? { q } : {}, {
		tags: { collection: 'tags', fields: ['name', 'slug'], sort: 'name', limit: -1 }
	});
	return {
		...data,
		q,
		title: q ? `Search: ${q}` : data.page > 1 ? `Blog, page ${data.page}` : 'Blog',
		description: 'Writing by Alex Wang on technology, servers, transportation and travel.',
		robots: q ? 'noindex, follow' : undefined
	};
}
