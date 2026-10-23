import getDirectusInstance from '#lib/directus.js';
import { readItems } from '@directus/sdk';

/** Home page data: Directus content loads up front, blog posts stream in afterwards. */
export async function load({ fetch }) {
	const directus = getDirectusInstance(fetch);

	// Not awaited: SvelteKit streams top-level promises, so the page renders before the blog responds
	const posts = fetch('https://blog.alexwang.net/wp-json/wp/v2/posts?per_page=4', {
		signal: AbortSignal.timeout(8000)
	}).then((/** @type {Response} */ res) => {
		if (!res.ok) throw new Error(`Blog request failed (${res.status})`);
		return res.json();
	});
	// It may reject while the Directus calls below are still awaited; without a handler Node treats that as fatal.
	// The page still sees the rejection through `posts` itself.
	posts.catch(() => {});

	// One failing collection leaves its section empty instead of failing the whole page
	const settle = (/** @type {Promise<any[]>} */ request, /** @type {string} */ name) =>
		request.catch((/** @type {unknown} */ err) => {
			console.error(`Directus ${name} unavailable`, err);
			return [];
		});

	const [certifications, socials, projects, recognitions] = await Promise.all([
		settle(
			directus.request(
				readItems('certifications', {
					fields: ['name', 'reference', 'date', 'image', 'url'],
					sort: 'sort'
				})
			),
			'certifications'
		),
		settle(
			directus.request(
				readItems('socials', { fields: ['name', 'color', 'url', 'icon'], sort: 'sort', limit: 9 })
			),
			'socials'
		),
		settle(
			directus.request(
				readItems('projects', {
					fields: ['title', 'slug', 'image', 'date'],
					sort: '-date',
					limit: 6
				})
			),
			'projects'
		),
		settle(
			directus.request(
				readItems('recognitions', {
					fields: ['name', 'image', 'description', 'date'],
					sort: 'sort'
				})
			),
			'recognitions'
		)
	]);

	return { posts, certifications, socials, projects, recognitions, title: 'Home' };
}
