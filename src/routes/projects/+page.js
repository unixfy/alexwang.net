import getDirectusInstance from '#lib/directus.js';
import { readItems } from '@directus/sdk';
import { byRecency } from '#lib/date.js';

export async function load({ fetch }) {
	const directus = getDirectusInstance(fetch);

	return {
		title: 'Projects',
		projects: (
			await directus.request(
				readItems('projects', {
					fields: ['title', 'slug', 'image', 'start_date', 'end_date'],
					limit: -1
				})
			)
		).sort(byRecency)
	};
}
