import getDirectusInstance, { describe } from '#lib/directus.js';
import { collections } from '#lib/cms.js';
import { excerpt } from '#lib/excerpt.js';
import { byRecency } from '#lib/date.js';
import { listPosts } from '#lib/blog.js';

/** How many projects and blog posts the home page shows, so the two sections match. */
const FEATURED = 4;

/**
 * Home page data. Everything comes from Directus, on the server and in as few trips as it can:
 * one query for the six collections, one for the latest posts.
 */
export async function load({ fetch }) {
	const [rows, posts] = await Promise.all([
		collections(fetch, {
			certifications: {
				collection: 'certifications',
				fields: ['name', 'reference', 'date', 'image', 'url'],
				sort: 'sort'
			},
			socials: {
				collection: 'socials',
				fields: ['name', 'color', 'url', 'icon'],
				sort: 'sort',
				limit: 9
			},
			projects: {
				collection: 'projects',
				fields: ['title', 'slug', 'image', 'start_date', 'end_date', 'url', 'content_html'],
				limit: -1
			},
			recognitions: {
				collection: 'recognitions',
				fields: ['name', 'image', 'description', 'date'],
				sort: 'sort'
			},
			employments: {
				collection: 'employments',
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
			},
			educations: {
				collection: 'educations',
				fields: ['start_date', 'end_date', 'institution_name', 'degree_name', 'description'],
				sort: 'sort'
			}
		}),
		// a failing blog leaves its section empty instead of failing the whole page
		listPosts(getDirectusInstance(fetch), { page: 1 })
			.then(({ posts }) => posts.slice(0, FEATURED))
			.catch((/** @type {unknown} */ err) => {
				console.error(`Directus posts unavailable: ${describe(err)}`);
				return [];
			})
	]);

	return {
		posts,
		certifications: rows.certifications,
		socials: rows.socials,
		// the CMS can't put "still running" first, so order them here, then keep the featured few;
		// only the opening words go to the page, not each project's whole write-up
		projects: rows.projects
			.sort(byRecency)
			.slice(0, FEATURED)
			.map(({ content_html, ...project }) => ({ ...project, excerpt: excerpt(content_html) })),
		recognitions: rows.recognitions,
		employments: rows.employments,
		educations: rows.educations,
		title: 'Home'
	};
}
