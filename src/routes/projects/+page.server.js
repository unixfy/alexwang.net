import { collections } from '#lib/cms.js';
import { byRecency } from '#lib/date.js';
import { excerpt } from '#lib/excerpt.js';

export async function load({ fetch }) {
	const { projects } = await collections(fetch, {
		projects: {
			collection: 'projects',
			fields: ['title', 'slug', 'image', 'start_date', 'end_date', 'content_html'],
			limit: -1,
			required: true
		}
	});

	return {
		title: 'Projects',
		// the opening words of each write-up travel with the list; the whole text stays on its page
		projects: projects.sort(byRecency).map(({ content_html, ...project }) => ({
			...project,
			excerpt: excerpt(content_html, 150)
		}))
	};
}
