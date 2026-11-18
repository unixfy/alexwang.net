// The production build (`npm run build`), run in Node with the CMS replaced by the fake one. Used by
// the Playwright system tests (over HTTP) and by the CPU budget check (in process).
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { fakeCms } from '../helpers/cms.js';
import { fixtures } from '../helpers/fixtures.js';

const root = fileURLToPath(new URL('../../.svelte-kit/output/', import.meta.url));

/** Turnstile's documented test keys: the widget always passes and the secret always verifies. */
export const env = {
	TURNSTILE_SITE_KEY: '1x00000000000000000000AA',
	TURNSTILE_SECRET_KEY: '1x0000000000000000000000000000000AA',
	DIRECTUS_COMMENTS_TOKEN: 'test-token'
};

/**
 * Start the built server with every request to the CMS and to Turnstile answered by the fake.
 * @param {{ replay?: boolean }} [options] `replay` keeps each CMS answer's text after the first time,
 *   so a CPU measurement counts the site's own work and not the fake's
 */
export async function start({ replay = false } = {}) {
	const cms = fakeCms(fixtures());
	const real = globalThis.fetch;
	/** @type {Map<string, { status: number, text: string }>} */
	const recorded = new Map();
	globalThis.fetch = /** @type {any} */ (
		async (/** @type {any} */ input, /** @type {any} */ init) => {
			const url = String(input instanceof Request ? input.url : input);
			if (!/^https:\/\/(cms\.alexwang\.net|challenges\.cloudflare\.com)\//.test(url))
				return real(input, init);
			if (!replay) return cms(input, init);
			// SvelteKit's server fetch hands over a Request, its body inside
			const method = init?.method ?? (input instanceof Request ? input.method : 'GET');
			const body =
				typeof init?.body === 'string'
					? init.body
					: input instanceof Request && method !== 'GET'
						? await input.clone().text()
						: '';
			const key = `${method} ${url} ${body}`;
			let hit = recorded.get(key);
			if (!hit) {
				const res = await cms(input, init);
				hit = { status: res.status, text: await res.text() };
				recorded.set(key, hit);
			}
			return new Response(hit.text, {
				status: hit.status,
				headers: { 'content-type': 'application/json', 'access-control-allow-origin': '*' }
			});
		}
	);

	const { Server } = await import(join(root, 'server/index.js'));
	const { manifest } = await import(join(root, 'server/manifest.js'));
	const server = new Server(manifest);
	await server.init({
		env,
		read: (/** @type {string} */ file) =>
			/** @type {any} */ (new Response(/** @type {any} */ (readFile(join(root, 'client', file)))))
	});

	/**
	 * Answer a request the way the Worker would: static files first, then SvelteKit.
	 * @param {Request} request
	 */
	async function respond(request) {
		const { pathname } = new URL(request.url);
		const file = join(root, 'client', normalize(decodeURIComponent(pathname)));
		if (file.startsWith(join(root, 'client')) && pathname !== '/') {
			const info = await stat(file).catch(() => null);
			if (info?.isFile()) {
				return new Response(await readFile(file), {
					headers: { 'content-type': TYPES[extname(file)] ?? 'application/octet-stream' }
				});
			}
		}
		return server.respond(request, {
			getClientAddress: () => '127.0.0.1',
			platform: {}
		});
	}

	return { respond, cms };
}

const TYPES = /** @type {Record<string, string>} */ ({
	'.js': 'text/javascript',
	'.css': 'text/css',
	'.svg': 'image/svg+xml',
	'.png': 'image/png',
	'.woff2': 'font/woff2',
	'.json': 'application/json',
	'.webmanifest': 'application/manifest+json',
	'.txt': 'text/plain'
});
