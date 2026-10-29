import getDirectusInstance, { describe } from '#lib/directus.js';
import { readItems } from '@directus/sdk';
import { error, redirect } from '@sveltejs/kit';
import { visible, categoriesOf, asset } from '#lib/blog.js';
import { render } from '#lib/editorjs.js';
import { excerpt } from '#lib/excerpt.js';

export async function load({ fetch, params, data: server }) {
	const directus = getDirectusInstance(fetch);

	const found = await directus.request(
		readItems('posts', {
			fields: [
				'title',
				'slug',
				'excerpt',
				'content',
				'date_published',
				'featured_image',
				'comments_enabled',
				'redirect_url',
				'seo_description',
				'seo_noindex',
				'seo_nofollow',
				'seo_noarchive',
				'categories.is_primary',
				'categories.categories_id.name',
				'categories.categories_id.slug',
				'tags.tags_id.name',
				'tags.tags_id.slug'
			],
			filter: { _and: [visible(), { slug: { _eq: params.slug } }] },
			limit: 1
		})
	);
	if (found.length === 0) error(404, 'Post not found');
	const post = /** @type {any} */ (found[0]);

	// a stub that stands in for something published elsewhere
	if (post.redirect_url) redirect(307, post.redirect_url);

	const when = post.date_published;
	const neighbour = (/** @type {'older' | 'newer'} */ which) =>
		directus
			.request(
				readItems('posts', {
					fields: ['title', 'slug', 'date_published', 'featured_image'],
					filter: {
						_and: [
							visible(),
							{ slug: { _neq: post.slug } },
							{ date_published: { [which === 'older' ? '_lte' : '_gte']: when } }
						]
					},
					sort: [which === 'older' ? '-date_published' : 'date_published'],
					limit: 1
				})
			)
			.then((rows) => rows[0] ?? null)
			.catch(() => null);

	const [older, newer, comments] = await Promise.all([
		neighbour('older'),
		neighbour('newer'),
		post.comments_enabled
			? directus
					.request(
						readItems('comments', {
							fields: ['id', 'parent', 'author_name', 'content', 'date_created'],
							filter: {
								_and: [{ status: { _eq: 'published' } }, { post: { slug: { _eq: post.slug } } }]
							},
							sort: ['date_created'],
							limit: -1
						})
					)
					.catch((/** @type {unknown} */ err) => {
						console.error(`Directus comments unavailable: ${describe(err)}`);
						return null;
					})
			: []
	]);

	const body = render(post.content);
	const robots = [
		post.seo_noindex && 'noindex',
		post.seo_nofollow && 'nofollow',
		post.seo_noarchive && 'noarchive'
	]
		.filter(Boolean)
		.join(', ');

	const { content, ...rest } = post;
	return {
		post: {
			...rest,
			categories: categoriesOf(post),
			tags: (post.tags ?? []).map((/** @type {any} */ t) => t.tags_id).filter(Boolean)
		},
		body: body.html,
		headings: body.headings,
		minutes: Math.max(1, Math.round(body.words / 220)),
		older,
		newer,
		comments,
		turnstileSiteKey: server?.turnstileSiteKey ?? '',
		title: post.title,
		description: post.seo_description || excerpt(post.excerpt, 200) || excerpt(body.html, 200),
		image: asset(post.featured_image, 1200),
		ogType: 'article',
		robots: robots || undefined
	};
}
