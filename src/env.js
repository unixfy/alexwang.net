import { defineEnvVars } from '@sveltejs/kit/env';

/** Optional: without them comments can't be sent, but nothing else is affected. */
const optional = (/** @type {string | undefined} */ value) => value || undefined;

export const variables = defineEnvVars({
	TURNSTILE_SITE_KEY: {
		public: true,
		schema: optional,
		description: 'Cloudflare Turnstile site key, shown to the browser for the comment form.'
	},
	TURNSTILE_SECRET_KEY: {
		schema: optional,
		description: 'Cloudflare Turnstile secret key, used to verify a comment form’s captcha.'
	},
	DIRECTUS_COMMENTS_TOKEN: {
		schema: optional,
		description: 'Directus static token whose role can read posts and comments and create comments.'
	}
});
