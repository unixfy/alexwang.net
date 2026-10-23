import getDirectusInstance from '#lib/directus.js';
import { readItems } from '@directus/sdk';
import { error } from '@sveltejs/kit';

export async function load({ fetch, params }) {
	const directus = getDirectusInstance(fetch);

	const [page_req, all] = await Promise.all([
		directus.request(
			readItems('pages', {
				fields: ['title', 'subtitle', 'content_html', 'slug', 'date_updated'],
				filter: { slug: params.slug },
				limit: 1
			})
		),
		// only used to offer a "next stop"; the page works without it
		directus
			.request(readItems('pages', { fields: ['slug', 'title'], sort: 'title', limit: -1 }))
			.catch(() => [])
	]);

	if (page_req.length === 0) {
		error(404, 'Page not found in CMS');
	}

	const page = page_req[0];
	const at = all.findIndex((p) => p.slug === page.slug);
	const next = all.length > 1 && at >= 0 ? all[(at + 1) % all.length] : null;

	return {
		page,
		next,
		title: page.title
	};
}
