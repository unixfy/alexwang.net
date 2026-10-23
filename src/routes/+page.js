import getDirectusInstance from '#lib/directus.js';
import { readItems } from '@directus/sdk';

/** Home page data: Directus content loads up front, blog posts stream in afterwards. */
export async function load({ fetch }) {
	const directus = getDirectusInstance(fetch);

	// Not awaited: SvelteKit streams top-level promises, so the page renders before the blog responds
	const posts = fetch('https://blog.alexwang.net/wp-json/wp/v2/posts?per_page=4').then(
		(/** @type {Response} */ res) => {
			if (!res.ok) throw new Error(`Blog request failed (${res.status})`);
			return res.json();
		}
	);

	const [certifications, socials, projects, recognitions] = await Promise.all([
		directus.request(
			readItems('certifications', {
				fields: ['name', 'reference', 'date', 'image', 'url'],
				sort: 'sort'
			})
		),
		directus.request(
			readItems('socials', { fields: ['name', 'color', 'url', 'icon'], sort: 'sort', limit: 9 })
		),
		directus.request(
			readItems('projects', { fields: ['title', 'slug', 'image', 'date'], sort: '-date', limit: 6 })
		),
		directus.request(
			readItems('recognitions', {
				fields: ['name', 'image', 'description', 'date'],
				sort: 'sort'
			})
		)
	]);

	return { posts, certifications, socials, projects, recognitions, title: 'Home' };
}
