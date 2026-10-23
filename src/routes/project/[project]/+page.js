import getDirectusInstance from '#lib/directus.js';
import { readItems } from '@directus/sdk';
import { error } from '@sveltejs/kit';

export async function load({ fetch, params }) {
	const directus = getDirectusInstance(fetch);

	const [project_req, all] = await Promise.all([
		directus.request(
			readItems('projects', {
				fields: ['title', 'slug', 'content_html', 'image', 'date', 'url'],
				filter: { slug: params.project },
				limit: 1
			})
		),
		// the whole line, newest first, so the page knows its neighbours
		directus
			.request(
				readItems('projects', { fields: ['slug', 'title', 'date'], sort: '-date', limit: -1 })
			)
			.catch(() => [])
	]);

	if (project_req.length === 0) {
		error(404, 'Page not found in CMS');
	}

	const project = project_req[0];
	const at = all.findIndex((p) => p.slug === project.slug);

	return {
		project,
		index: at,
		total: all.length,
		prev: at > 0 ? all[at - 1] : null,
		next: at >= 0 && at < all.length - 1 ? all[at + 1] : null,
		title: project.title
	};
}
