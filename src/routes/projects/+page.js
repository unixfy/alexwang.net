import getDirectusInstance from '#lib/directus.js';
import { readItems } from '@directus/sdk';

export async function load({ fetch }) {
	const directus = getDirectusInstance(fetch);

	return {
		title: 'Projects',
		projects: await directus.request(
			readItems('projects', { fields: ['title', 'slug', 'image', 'date'], sort: '-date' })
		)
	};
}
