import { collections } from '#lib/cms.js';

export async function load({ fetch }) {
	const { links, socials } = await collections(fetch, {
		links: { collection: 'links', fields: ['title', 'url', 'icon'], sort: 'sort', required: true },
		socials: {
			collection: 'socials',
			fields: ['name', 'color', 'url', 'icon'],
			sort: 'sort',
			limit: 9,
			required: true
		}
	});

	return {
		links,
		socials,
		title: 'Links'
	};
}
