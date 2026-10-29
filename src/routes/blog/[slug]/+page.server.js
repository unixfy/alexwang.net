import { TURNSTILE_SECRET_KEY, DIRECTUS_COMMENTS_TOKEN } from '$app/env/private';
import { TURNSTILE_SITE_KEY } from '$app/env/public';
import { createDirectus, rest, staticToken, readItems, createItem } from '@directus/sdk';
import { fail } from '@sveltejs/kit';
import getDirectusInstance, { describe } from '#lib/directus.js';
import { error, redirect } from '@sveltejs/kit';
import { visible, categoriesOf, asset, readingMinutes } from '#lib/blog.js';
import { render } from '#lib/editorjs.js';
import { excerpt } from '#lib/excerpt.js';

const VERIFY = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

// The whole page is loaded here, not in a universal load: the post's body is read and rendered on the
// server, and a universal load would send the CMS's copy of it to the browser as well.
export async function load({ fetch, params }) {
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
		minutes: readingMinutes(body.words),
		words: body.words,
		older,
		newer,
		comments,
		turnstileSiteKey: TURNSTILE_SITE_KEY ?? '',
		title: post.title,
		description: post.seo_description || excerpt(post.excerpt, 200) || excerpt(body.html, 200),
		image: asset(post.featured_image, 1200),
		ogType: 'article',
		robots: robots || undefined
	};
}

export const actions = {
	// Comments are written here, not by the browser: the captcha is checked first, and only this
	// server holds a token that can create them (always as drafts, awaiting moderation).
	async comment({ request, params, fetch, getClientAddress }) {
		const form = await request.formData();
		const text = (/** @type {string} */ key) => String(form.get(key) ?? '').trim();

		// a bot filled the hidden field: look like it worked
		if (text('website')) return { sent: true };

		const values = {
			author_name: text('name'),
			author_email: text('email'),
			content: text('content')
		};
		if (
			!values.author_name ||
			!values.content ||
			!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(values.author_email)
		) {
			return fail(400, { error: 'Please fill in your name, a valid email and a comment.', values });
		}
		if (
			values.author_name.length > 100 ||
			values.author_email.length > 200 ||
			values.content.length > 5000
		) {
			return fail(400, { error: 'That comment is too long.', values });
		}

		const verdict = await fetch(VERIFY, {
			method: 'POST',
			body: new URLSearchParams({
				secret: TURNSTILE_SECRET_KEY ?? '',
				response: text('cf-turnstile-response'),
				remoteip: getClientAddress()
			})
		})
			.then((res) => res.json())
			.catch(() => null);
		if (!verdict?.success) {
			return fail(400, { error: 'The spam check didn’t pass. Please try again.', values });
		}

		try {
			const directus = createDirectus('https://cms.alexwang.net', { globals: { fetch } })
				.with(staticToken(DIRECTUS_COMMENTS_TOKEN ?? ''))
				.with(rest());
			const [post] = await directus.request(
				readItems('posts', {
					fields: ['id', 'comments_enabled'],
					filter: { _and: [visible(), { slug: { _eq: params.slug } }] },
					limit: 1
				})
			);
			if (!post?.comments_enabled)
				return fail(404, { error: 'Comments are closed on this post.', values });

			// a reply must answer a comment on this same post
			let parent = null;
			if (text('parent')) {
				const [found] = await directus.request(
					readItems('comments', {
						fields: ['id'],
						filter: { _and: [{ id: { _eq: text('parent') } }, { post: { _eq: post.id } }] },
						limit: 1
					})
				);
				parent = found?.id ?? null;
			}

			await directus.request(
				createItem('comments', { ...values, post: post.id, parent, status: 'draft' })
			);
		} catch (err) {
			console.error('Comment not saved', err instanceof Error ? err.message : err);
			return fail(500, { error: 'That didn’t go through. Please try again in a moment.', values });
		}
		return { sent: true };
	}
};
