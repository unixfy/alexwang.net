import { TURNSTILE_SECRET_KEY, DIRECTUS_COMMENTS_TOKEN } from '$app/env/private';
import { TURNSTILE_SITE_KEY } from '$app/env/public';
import { createDirectus, rest, staticToken, readItems, createItem } from '@directus/sdk';
import { fail } from '@sveltejs/kit';
import { visible } from '#lib/blog.js';

const VERIFY = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

export function load() {
	return { turnstileSiteKey: TURNSTILE_SITE_KEY ?? '' };
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
