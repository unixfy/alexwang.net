import { collections } from '#lib/cms.js';
import { error } from '@sveltejs/kit';
import { byRecency } from '#lib/date.js';

export async function load({ fetch, params }) {
	const { project: found, all: line } = await collections(fetch, {
		project: {
			collection: 'projects',
			fields: ['title', 'slug', 'content_html', 'image', 'start_date', 'end_date', 'url'],
			filter: { slug: { _eq: params.project } },
			limit: 1,
			required: true
		},
		// the whole line, so the page knows its neighbours
		all: {
			collection: 'projects',
			fields: ['slug', 'title', 'start_date', 'end_date', 'image'],
			limit: -1
		}
	});

	if (found.length === 0) {
		error(404, 'Page not found in CMS');
	}

	// most recent first
	const all = line.sort(byRecency);
	const project = found[0];
	const at = all.findIndex((p) => p.slug === project.slug);

	return {
		project,
		route: all.map(({ slug, title }) => ({ slug, title })),
		index: at,
		total: all.length,
		prev: at > 0 ? all[at - 1] : null,
		next: at >= 0 && at < all.length - 1 ? all[at + 1] : null,
		title: project.title
	};
}
