import getDirectusInstance from '#lib/directus.js';
import { readItems } from '@directus/sdk';
import { ORIGIN, visible, categoriesOf } from '#lib/blog.js';
import { render } from '#lib/editorjs.js';

/** @param {string} s */
const xml = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
/** @param {string} s */
const cdata = (s) => `<![CDATA[${s.replace(/]]>/g, ']]]]><![CDATA[>')}]]>`;

export async function GET({ fetch }) {
	const posts = await getDirectusInstance(fetch).request(
		readItems('posts', {
			fields: [
				'title',
				'slug',
				'excerpt',
				'seo_description',
				'content',
				'date_published',
				'redirect_url',
				'categories.is_primary',
				'categories.categories_id.name',
				'categories.categories_id.slug'
			],
			filter: visible(),
			sort: ['-date_published'],
			limit: 20
		})
	);

	const items = posts
		.map((post) => {
			const link = post.redirect_url || `${ORIGIN}/blog/${post.slug}`;
			return `<item>
<title>${xml(post.title)}</title>
<link>${xml(link)}</link>
<guid isPermaLink="true">${xml(`${ORIGIN}/blog/${post.slug}`)}</guid>
${post.date_published ? `<pubDate>${new Date(post.date_published).toUTCString()}</pubDate>` : ''}
${categoriesOf(post)
	.map((c) => `<category>${xml(c.name)}</category>`)
	.join('\n')}
<description>${cdata(post.excerpt || post.seo_description || '')}</description>
<content:encoded>${cdata(render(post.content).html)}</content:encoded>
</item>`;
		})
		.join('\n');

	const body = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
<title>Alex Wang</title>
<link>${ORIGIN}/blog</link>
<atom:link href="${ORIGIN}/blog/feed" rel="self" type="application/rss+xml" />
<description>Technology, servers, transportation and travel.</description>
<language>en-US</language>
${items}
</channel>
</rss>`;

	return new Response(body, {
		headers: {
			'content-type': 'application/rss+xml; charset=utf-8',
			'cache-control': 'public, max-age=900'
		}
	});
}
