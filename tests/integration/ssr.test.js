// Each page, server-rendered from what its real load function returns for the fake CMS: the HTML a
// visitor (or a search engine) gets before any script runs.
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { render } from 'svelte/server';
import { fakeCms } from '../helpers/cms.js';
import { fixtures } from '../helpers/fixtures.js';
import { page, resetPage } from '../helpers/app.svelte.js';

vi.mock('$app/state', () => import('../helpers/app.svelte.js'));
vi.mock('$app/navigation', () => import('../helpers/app.svelte.js'));
vi.mock('$app/forms', () => import('../helpers/app.svelte.js'));
vi.mock('$app/env/private', () => ({ TURNSTILE_SECRET_KEY: 's', DIRECTUS_COMMENTS_TOKEN: 't' }));
vi.mock('$app/env/public', () => ({ TURNSTILE_SITE_KEY: 'k' }));

const routes = /** @type {Record<string, { load: string, page: string, params?: any }>} */ ({
	'/': { load: '+page.server.js', page: '+page.svelte' },
	'/blog': { load: 'blog/+page.server.js', page: 'blog/+page.svelte' },
	'/blog/category/technology': {
		load: 'blog/category/[slug]/+page.server.js',
		page: 'blog/category/[slug]/+page.svelte',
		params: { slug: 'technology' }
	},
	'/blog/tag/rail': {
		load: 'blog/tag/[slug]/+page.server.js',
		page: 'blog/tag/[slug]/+page.svelte',
		params: { slug: 'rail' }
	},
	'/blog/post-1': {
		load: 'blog/[slug]/+page.server.js',
		page: 'blog/[slug]/+page.svelte',
		params: { slug: 'post-1' }
	},
	'/projects': { load: 'projects/+page.server.js', page: 'projects/+page.svelte' },
	'/project/transit-map': {
		load: 'project/[project]/+page.server.js',
		page: 'project/[project]/+page.svelte',
		params: { project: 'transit-map' }
	},
	'/now': { load: '[slug]/+page.server.js', page: '[slug]/+page.svelte', params: { slug: 'now' } },
	'/links': { load: 'links/+page.server.js', page: 'links/+page.svelte' },
	'/sshkey': { load: 'sshkey/+page.js', page: 'sshkey/+page.svelte' }
});

const modules = import.meta.glob('../../src/routes/**/+*.{js,svelte}');
const mod = (/** @type {string} */ file) =>
	/** @type {Promise<any>} */ (modules[`../../src/routes/${file}`]());

/** @type {ReturnType<typeof fakeCms>} */
let cms;
beforeEach(() => {
	cms = fakeCms(fixtures());
	resetPage();
});

describe('server-rendered pages', () => {
	test.each(Object.keys(routes))('%s', async (path) => {
		const route = routes[path];
		const url = new URL(`https://alexwang.net${path}`);
		const event = { fetch: cms, url, params: route.params ?? {} };
		const layout = await (await mod('+layout.server.js')).load(event);
		const data = { ...layout, ...(await (await mod(route.load)).load(event)) };
		page.url = url;
		page.params = route.params ?? {};
		page.data = data;

		const Layout = (await mod('+layout.svelte')).default;
		const Page = (await mod(route.page)).default;
		const { body, head } = render(Layout, {
			props: {
				data,
				// the page is the layout's child, as SvelteKit renders it
				children: /** @type {any} */ (($$renderer) => Page($$renderer, { data }))
			}
		});
		expect(head).toContain(`<title>${data.title.replace(/&/g, '&amp;')} | Alex Wang</title>`);
		expect(body).toContain('<main id="main"');
		expect(body).toContain('Copyright');
		expect(body.length).toBeGreaterThan(2000);
	});

	test('the home page hides the email address from scrapers until script runs', async () => {
		const event = { fetch: cms, url: new URL('https://alexwang.net/'), params: {} };
		const data = {
			...(await (await mod('+layout.server.js')).load(event)),
			...(await (await mod('+page.server.js')).load(event))
		};
		const Page = (await mod('+page.svelte')).default;
		const { body } = render(Page, { props: { data } });
		expect(body).toContain('alex [at] alexwang.net');
		expect(body).not.toContain('mailto:');
	});

	test('the error page', async () => {
		page.status = 404;
		const { body } = render((await mod('+error.svelte')).default);
		expect(body).toContain('This stop isn’t on the line.');
	});
});
