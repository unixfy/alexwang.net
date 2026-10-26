import getDirectusInstance from '#lib/directus.js';
import { readItems } from '@directus/sdk';
import { byRecency } from '#lib/date.js';
import { excerpt } from '#lib/excerpt.js';

export async function load({ fetch }) {
	const directus = getDirectusInstance(fetch);

	return {
		title: 'Projects',
		// the opening words of each write-up travel with the list; the whole text stays on its page
		projects: await directus
			.request(
				readItems('projects', {
					fields: ['title', 'slug', 'image', 'start_date', 'end_date', 'content_html'],
					limit: -1
				})
			)
			.then((/** @type {any[]} */ rows) =>
				rows.sort(byRecency).map(({ content_html, ...project }) => ({
					...project,
					excerpt: excerpt(content_html, 150)
				}))
			)
	};
}
