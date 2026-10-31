import { collections } from '#lib/cms.js';
import { error } from '@sveltejs/kit';

export async function load({ fetch, params }) {
	const { page: found, all } = await collections(fetch, {
		page: {
			collection: 'pages',
			fields: ['title', 'subtitle', 'content_html', 'slug', 'date_updated'],
			filter: { slug: { _eq: params.slug } },
			limit: 1,
			required: true
		},
		// only used to offer a "next stop"; the page works without it
		all: { collection: 'pages', fields: ['slug', 'title'], sort: 'title', limit: -1 }
	});

	if (found.length === 0) {
		error(404, 'Page not found in CMS');
	}

	const page = found[0];
	const at = all.findIndex((p) => p.slug === page.slug);
	const next = all.length > 1 && at >= 0 ? all[(at + 1) % all.length] : null;

	return {
		page,
		next,
		title: page.title
	};
}
