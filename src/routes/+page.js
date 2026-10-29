import getDirectusInstance, { describe } from '#lib/directus.js';
import { readItems } from '@directus/sdk';
import { excerpt } from '#lib/excerpt.js';
import { byRecency } from '#lib/date.js';
import { listPosts } from '#lib/blog.js';

/** How many projects and blog posts the home page shows, so the two sections match. */
const FEATURED = 4;

/** Home page data: Directus content loads up front, blog posts stream in afterwards. */
export async function load({ fetch }) {
	const directus = getDirectusInstance(fetch);

	// Not awaited: SvelteKit streams top-level promises, so the page renders before the posts arrive.
	// It may reject while the calls below are still awaited; without a handler Node treats that as fatal.
	// The page still sees the rejection through `posts` itself.
	const posts = listPosts(directus, {}).then(({ posts }) => posts.slice(0, FEATURED));
	posts.catch(() => {});

	// One failing collection leaves its section empty instead of failing the whole page
	const settle = (/** @type {Promise<any[]>} */ request, /** @type {string} */ name) =>
		request.catch((/** @type {unknown} */ err) => {
			console.error(`Directus ${name} unavailable: ${describe(err)}`);
			return [];
		});

	const [certifications, socials, projects, recognitions, employments, educations] =
		await Promise.all([
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
				directus
					.request(
						readItems('projects', {
							fields: ['title', 'slug', 'image', 'start_date', 'end_date', 'url', 'content_html'],
							limit: -1
						})
					)
					// the CMS can't put "still running" first, so order them here, then keep the featured few;
					// only the opening words go to the page, not each project's whole write-up
					.then((/** @type {any[]} */ rows) =>
						rows
							.sort(byRecency)
							.slice(0, FEATURED)
							.map(({ content_html, ...project }) => ({
								...project,
								excerpt: excerpt(content_html)
							}))
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
			),
			settle(
				directus.request(
					readItems('employments', {
						fields: [
							'start_date',
							'end_date',
							'title',
							'employer_name',
							'employer_url',
							'location',
							'description'
						],
						sort: 'sort'
					})
				),
				'employments'
			),
			settle(
				directus.request(
					readItems('educations', {
						fields: ['start_date', 'end_date', 'institution_name', 'degree_name', 'description'],
						sort: 'sort'
					})
				),
				'educations'
			)
		]);

	return {
		posts,
		certifications,
		socials,
		projects,
		recognitions,
		employments,
		educations,
		title: 'Home'
	};
}
