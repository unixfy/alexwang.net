import getDirectusInstance from '#lib/directus.js';
import { readItems } from '@directus/sdk';
import { ORIGIN, visible } from '#lib/blog.js';

/** @param {string} s */
const xml = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');

export async function GET({ fetch }) {
	const directus = getDirectusInstance(fetch);
	/** @param {string} collection @param {object} [query] */
	const slugs = (collection, query = {}) =>
		directus
			.request(readItems(collection, { fields: ['slug'], limit: -1, ...query }))
			.then((rows) => rows.map((r) => r.slug))
			.catch(() => /** @type {string[]} */ ([]));

	const [pages, projects, categories, tags, posts] = await Promise.all([
		slugs('pages', { filter: { status: { _eq: 'published' } } }),
		slugs('projects', { filter: { status: { _eq: 'published' } } }),
		slugs('categories'),
		slugs('tags'),
		directus
			.request(
				readItems('posts', {
					fields: ['slug', 'date_published', 'redirect_url', 'seo_noindex'],
					filter: visible(),
					sort: ['-date_published'],
					limit: -1
				})
			)
			.catch(() => [])
	]);

	/** @type {{ loc: string, lastmod?: string }[]} */
	const urls = [
		{ loc: '/' },
		{ loc: '/projects' },
		{ loc: '/blog' },
		...pages.map((s) => ({ loc: `/${s}` })),
		...projects.map((s) => ({ loc: `/project/${s}` })),
		...categories.map((s) => ({ loc: `/blog/category/${s}` })),
		...tags.map((s) => ({ loc: `/blog/tag/${s}` })),
		// stubs that point elsewhere and posts asked to stay out of search are left off
		...posts
			.filter((p) => !p.redirect_url && !p.seo_noindex)
			.map((p) => ({ loc: `/blog/${p.slug}`, lastmod: p.date_published?.slice(0, 10) }))
	];

	const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
	.map(
		(u) =>
			`<url><loc>${xml(ORIGIN + u.loc)}</loc>${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ''}</url>`
	)
	.join('\n')}
</urlset>`;

	return new Response(body, {
		headers: {
			'content-type': 'application/xml; charset=utf-8',
			'cache-control': 'public, max-age=3600'
		}
	});
}
