// Every server route, run through the real Directus SDK against a fake CMS.
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { isHttpError, isRedirect } from '@sveltejs/kit';
import { fakeCms } from '../helpers/cms.js';
import { fixtures } from '../helpers/fixtures.js';

const env = vi.hoisted(() => ({
	TURNSTILE_SITE_KEY: /** @type {string | undefined} */ ('site-key'),
	TURNSTILE_SECRET_KEY: /** @type {string | undefined} */ ('secret'),
	DIRECTUS_COMMENTS_TOKEN: /** @type {string | undefined} */ ('token')
}));
vi.mock('$app/env/private', () => ({
	get TURNSTILE_SECRET_KEY() {
		return env.TURNSTILE_SECRET_KEY;
	},
	get DIRECTUS_COMMENTS_TOKEN() {
		return env.DIRECTUS_COMMENTS_TOKEN;
	}
}));
vi.mock('$app/env/public', () => ({
	get TURNSTILE_SITE_KEY() {
		return env.TURNSTILE_SITE_KEY;
	}
}));

import * as layout from '../../src/routes/+layout.server.js';
import * as home from '../../src/routes/+page.server.js';
import * as blog from '../../src/routes/blog/+page.server.js';
import * as category from '../../src/routes/blog/category/[slug]/+page.server.js';
import * as tag from '../../src/routes/blog/tag/[slug]/+page.server.js';
import * as feed from '../../src/routes/blog/feed/+server.js';
import * as postsJson from '../../src/routes/blog/posts.json/+server.js';
import * as post from '../../src/routes/blog/[slug]/+page.server.js';
import * as linkedin from '../../src/routes/linkedin/+page.server.js';
import * as links from '../../src/routes/links/+page.server.js';
import * as portfolio from '../../src/routes/portfolio/+page.server.js';
import * as project from '../../src/routes/project/[project]/+page.server.js';
import * as projects from '../../src/routes/projects/+page.server.js';
import * as sitemap from '../../src/routes/sitemap.xml/+server.js';
import * as cmsPage from '../../src/routes/[slug]/+page.server.js';
import * as sshkey from '../../src/routes/sshkey/+page.js';

/** @type {ReturnType<typeof fakeCms>} */
let cms;
/** @type {ReturnType<typeof vi.spyOn>} */
let errors;

beforeEach(() => {
	cms = fakeCms(fixtures());
	errors = vi.spyOn(console, 'error').mockImplementation(() => {});
	env.TURNSTILE_SITE_KEY = 'site-key';
	env.TURNSTILE_SECRET_KEY = 'secret';
	env.DIRECTUS_COMMENTS_TOKEN = 'token';
});

/** Run something that should throw a SvelteKit error or redirect, and return what it threw. */
async function thrown(/** @type {() => any} */ fn) {
	try {
		await fn();
	} catch (e) {
		return /** @type {any} */ (e);
	}
	throw new Error('expected a throw');
}

/** @param {string} path */
const ev = (path, params = {}) =>
	/** @type {any} */ ({ fetch: cms, url: new URL(`https://alexwang.net${path}`), params });

describe('layout', () => {
	test('loads the site config', async () => {
		const { config } = /** @type {any} */ (await layout.load(ev('/')));
		expect(config.sshkey).toMatch(/^ssh-ed25519/);
	});

	test('falls back to an empty config when the CMS is down', async () => {
		cms.state.fail.add('config');
		const { config } = /** @type {any} */ (await layout.load(ev('/')));
		expect(config).toEqual({
			banner_enabled: false,
			banner_content: '',
			sshkey: '',
			links_profile_picture: null,
			homepage_welcome_text: '',
			lead_text: ''
		});
		expect(errors).toHaveBeenCalledWith('Directus config unavailable: config is unavailable');
	});
});

describe('home', () => {
	test('everything in two trips; projects ordered, trimmed and excerpted', async () => {
		const data = /** @type {any} */ (await home.load(ev('/')));
		expect(cms.state.calls).toHaveLength(2);
		expect(data.title).toBe('Home');
		expect(data.posts).toHaveLength(4);
		expect(data.projects.map((/** @type {any} */ p) => p.slug)).toEqual([
			'transit-map',
			'home-lab',
			'old-site'
		]);
		expect(data.projects[0]).toEqual(expect.objectContaining({ excerpt: 'A map of everything.', image: 'p1' }));
		expect(data.projects[0]).not.toHaveProperty('content_html');
		expect(data.projects[2].excerpt).toBe('');
		for (const k of ['certifications', 'socials', 'recognitions', 'employments', 'educations'])
			expect(data[k].length).toBeGreaterThan(0);
	});

	test('a failing blog leaves its section empty', async () => {
		cms.state.fail.add('posts');
		const data = /** @type {any} */ (await home.load(ev('/')));
		expect(data.posts).toEqual([]);
		expect(errors).toHaveBeenCalledWith('Directus posts unavailable: posts is unavailable');
	});
});

describe('blog archives', () => {
	test('the blog: posts, categories and tags', async () => {
		const data = /** @type {any} */ (await blog.load(ev('/blog')));
		expect(data).toEqual(
			expect.objectContaining({ title: 'Blog', q: '', robots: undefined, page: 1, hasOlder: true })
		);
		expect(data.tags).toHaveLength(2);
		expect(data.description).toMatch(/^Writing by Alex Wang/);
	});

	test('later pages and searches are titled; searches are not indexed', async () => {
		expect((/** @type {any} */ (await blog.load(ev('/blog?page=2')))).title).toBe('Blog, page 2');
		const long = 'x'.repeat(150);
		const search = /** @type {any} */ (await blog.load(ev(`/blog?q=%20${long}%20`)));
		expect(search.q).toBe('x'.repeat(100));
		expect(search.title).toBe(`Search: ${'x'.repeat(100)}`);
		expect(search.robots).toBe('noindex, follow');
		const blank = /** @type {any} */ (await blog.load(ev('/blog?q=%20%20')));
		expect(blank.q).toBe('');
	});

	test('a category page', async () => {
		const data = /** @type {any} */ (await category.load(ev('/blog/category/technology', { slug: 'technology' })));
		expect(data.category.name).toBe('Technology');
		expect(data.title).toBe('Technology');
		expect(data.description).toBe('Servers and code.');
		expect(data).not.toHaveProperty('found');
		const travel = /** @type {any} */ (await category.load(ev('/blog/category/travel?page=2', { slug: 'travel' })));
		expect(travel.title).toBe('Travel, page 2');
		expect(travel.description).toBe('Posts filed under Travel.');
	});

	test('an unknown category is a 404', async () => {
		const e = await thrown(() => category.load(ev('/blog/category/nope', { slug: 'nope' })));
		expect(isHttpError(e, 404)).toBe(true);
		expect(e.body.message).toBe('Category not found');
	});

	test('a tag page', async () => {
		const data = /** @type {any} */ (await tag.load(ev('/blog/tag/rail', { slug: 'rail' })));
		expect(data.tag.name).toBe('Rail');
		expect(data.description).toBe('Trains.');
		const linux = /** @type {any} */ (await tag.load(ev('/blog/tag/linux?page=2', { slug: 'linux' })));
		expect(linux.title).toBe('Linux, page 2');
		expect(linux.description).toBe('Posts tagged “Linux”.');
		const e = await thrown(() => tag.load(ev('/blog/tag/nope', { slug: 'nope' })));
		expect(isHttpError(e, 404)).toBe(true);
	});

	test('posts.json: a page of cards for the infinite scroll', async () => {
		const res = await postsJson.GET(ev('/blog/posts.json?page=2&category=technology&tag=rail&q=%20post%20'));
		expect(res.headers.get('cache-control')).toBe('public, max-age=60');
		const body = await res.json();
		expect(body.page).toBe(2);
		const call = new URL(cms.state.calls[0].url);
		expect(call.searchParams.get('search')).toBe('post');
		expect(call.searchParams.get('filter')).toContain('technology');

		const plain = await (await postsJson.GET(ev('/blog/posts.json'))).json();
		expect(plain.posts).toHaveLength(10);
	});
});

describe('feed', () => {
	test('an RSS feed of the ten latest posts, escaped', async () => {
		const posts = cms.state.collections.posts;
		posts[0].title = 'Trains & <buses>';
		posts[0].excerpt = 'A ]]> trap';
		posts[1].date_published = null;
		const res = await feed.GET(ev('/blog/feed'));
		expect(res.headers.get('content-type')).toBe('application/rss+xml; charset=utf-8');
		expect(res.headers.get('cache-control')).toBe('public, max-age=900');
		const xml = await res.text();
		expect(xml.match(/<item>/g)).toHaveLength(10);
		expect(xml).toContain('<title>Trains &amp; &lt;buses&gt;</title>');
		expect(xml).toContain('<description><![CDATA[A ]]]]><![CDATA[> trap]]></description>');
		expect(xml).toContain('<link>https://elsewhere.example/post</link>');
		expect(xml).toContain('<guid isPermaLink="true">https://alexwang.net/blog/post-6</guid>');
		expect(xml).toContain('<category>Technology</category>');
		expect(xml).toContain('<content:encoded><![CDATA[<p>Opening words');
		expect(xml).toMatch(/<pubDate>\w{3}, \d{2} \w{3} 2025/);
		// a post without a date has no pubDate, and one without any summary has an empty description
		expect(xml).toContain('<description><![CDATA[]]></description>');
	});
});

describe('sitemap', () => {
	test('every public page, leaving out stubs and noindex posts', async () => {
		cms.state.collections.posts[2].date_published = null;
		const res = await sitemap.GET(ev('/sitemap.xml'));
		expect(res.headers.get('content-type')).toBe('application/xml; charset=utf-8');
		const xml = await res.text();
		for (const loc of ['/', '/projects', '/blog', '/now', '/project/home-lab', '/blog/category/travel', '/blog/tag/rail'])
			expect(xml).toContain(`<loc>https://alexwang.net${loc}</loc>`);
		expect(xml).toContain('<url><loc>https://alexwang.net/blog/post-1</loc><lastmod>2025-12-28</lastmod></url>');
		expect(xml).toContain('<url><loc>https://alexwang.net/blog/post-3</loc></url>');
		expect(xml).not.toContain('/blog/post-6<'); // redirect stub
		expect(xml).not.toContain('/blog/post-7<'); // noindex
	});

	test('a failing collection leaves only its own URLs out', async () => {
		cms.state.fail.add('posts');
		cms.state.fail.add('tags');
		cms.state.collections.pages[0].slug = 'a&b<c';
		const xml = await (await sitemap.GET(ev('/sitemap.xml'))).text();
		expect(xml).not.toContain('/blog/post-');
		expect(xml).not.toContain('/blog/tag/');
		expect(xml).toContain('/project/transit-map');
		expect(xml).toContain('<loc>https://alexwang.net/a&amp;b&lt;c</loc>');
	});
});

describe('a post', () => {
	const load = (/** @type {string} */ slug) => post.load(ev(`/blog/${slug}`, { slug }));

	test('the post, rendered, with its neighbours and comments', async () => {
		const data = /** @type {any} */ (await load('post-2'));
		expect(data.title).toBe('Post number 2 & friends');
		expect(data.post).not.toHaveProperty('content');
		expect(data.post.categories[0]).toMatchObject({ is_primary: true, name: 'Travel', slug: 'travel' });
		expect(data.post.tags).toMatchObject([{ name: 'Linux', slug: 'linux' }]);
		expect(data.body).toContain('<h2 id="getting-started">Getting started</h2>');
		expect(data.headings.map((/** @type {any} */ h) => h.id)).toEqual(['getting-started', 'details', 'wrapping-up']);
		expect(data.words).toBeGreaterThan(400);
		expect(data.minutes).toBe(Math.max(1, Math.round(data.words / 220)));
		expect(data.older.slug).toBe('post-3');
		expect(data.newer.slug).toBe('post-1');
		expect(data.comments).toEqual([]); // comments are off on this post
		expect(data.turnstileSiteKey).toBe('site-key');
		expect(data.description).toBe('SEO text for post 2');
		expect(data.image).toBeNull();
		expect(data.ogType).toBe('article');
		expect(data.robots).toBeUndefined();
	});

	test('comments are loaded where enabled; a failure shows as null', async () => {
		const data = /** @type {any} */ (await load('post-1'));
		expect(data.comments.map((/** @type {any} */ c) => c.id)).toEqual([1, 2, 3]);
		expect(data.description).toBe('Summary of post 1');
		expect(data.image).toBe('https://cms.alexwang.net/assets/img-1?format=webp&width=1200');
		expect(data.newer).toBeNull();

		cms.state.fail.add('comments');
		expect((/** @type {any} */ (await load('post-1'))).comments).toBeNull();
		expect(errors).toHaveBeenCalledWith('Directus comments unavailable: comments is unavailable');
	});

	test('neighbours that fail to load are simply absent', async () => {
		const real = cms;
		cms = /** @type {any} */ (
			Object.assign(
				async (/** @type {any} */ input, /** @type {any} */ init) =>
					String(input).includes('_neq') ? Response.json({}, { status: 500 }) : real(input, init),
				{ state: real.state }
			)
		);
		const data = /** @type {any} */ (await load('post-3'));
		expect(data.older).toBeNull();
		expect(data.newer).toBeNull();
	});

	test('the description falls back to the body', async () => {
		cms.state.collections.posts[2].seo_description = null;
		cms.state.collections.posts[2].excerpt = null;
		expect((/** @type {any} */ (await load('post-3'))).description).toMatch(/^Opening words with bold, a link and code\./);
	});

	test('robots settings are joined', async () => {
		Object.assign(cms.state.collections.posts[1], { seo_noindex: true, seo_nofollow: true, seo_noarchive: true });
		expect((/** @type {any} */ (await load('post-2'))).robots).toBe('noindex, nofollow, noarchive');
		Object.assign(cms.state.collections.posts[1], { seo_noindex: false, seo_nofollow: true, seo_noarchive: false, tags: undefined });
		const data = /** @type {any} */ (await load('post-2'));
		expect(data.robots).toBe('nofollow');
		expect(data.post.tags).toEqual([]);
	});

	test('without every comment setting the form is replaced by a note', async () => {
		env.DIRECTUS_COMMENTS_TOKEN = undefined;
		expect((/** @type {any} */ (await load('post-2'))).turnstileSiteKey).toBe('');
	});

	test('a missing post is a 404; a stub redirects', async () => {
		const missing = await thrown(() => load('nope'));
		expect(isHttpError(missing, 404)).toBe(true);
		const stub = await thrown(() => load('post-6'));
		expect(stub, String(stub?.message ?? stub?.body?.message)).toSatisfy(isRedirect);
		expect(stub.status).toBe(307);
		expect(stub.location).toBe('https://elsewhere.example/post');
	});
});

describe('posting a comment', () => {
	/**
	 * @param {Record<string, string>} fields
	 * @param {{ slug?: string, address?: () => string }} [opts]
	 */
	const send = (fields, { slug = 'post-1', address = () => '203.0.113.9' } = {}) => {
		const form = new FormData();
		for (const [k, v] of Object.entries(fields)) form.set(k, v);
		return /** @type {any} */ (
			post.actions.comment(
				/** @type {any} */ ({
					request: new Request('https://alexwang.net/blog/x', { method: 'POST', body: form }),
					params: { slug },
					fetch: cms,
					getClientAddress: address
				})
			)
		);
	};
	const good = {
		name: '  Ada \n Lovelace ',
		email: 'ada@example.com',
		content: 'Line one\r\nLine two\rthree\u0000\u0007\u001b',
		'cf-turnstile-response': 'tok'
	};

	test('a good comment is checked and saved as a draft', async () => {
		expect(await send(good)).toEqual({ sent: true });
		const verify = cms.state.calls.find((c) => c.url.startsWith('https://challenges.cloudflare.com/'));
		expect(Object.fromEntries(new URLSearchParams(verify?.body))).toEqual({
			secret: 'secret',
			response: 'tok',
			remoteip: '203.0.113.9'
		});
		expect(cms.state.created).toEqual([
			{
				collection: 'comments',
				item: {
					author_name: 'Ada Lovelace',
					author_email: 'ada@example.com',
					content: 'Line one\nLine two\nthree',
					post: 1,
					parent: null,
					status: 'draft'
				}
			}
		]);
	});

	test('the Turnstile check is sent as a URL-encoded body', async () => {
		await send(good);
		const verify = cms.state.calls.find((c) => c.url.startsWith('https://challenges.cloudflare.com/'));
		expect(verify?.method).toBe('POST');
	});

	test('the check runs without a client address', async () => {
		expect(
			await send(good, {
				address: () => {
					throw new Error('no address');
				}
			})
		).toEqual({ sent: true });
	});

	test('a reply must answer a comment on the same post', async () => {
		await send({ ...good, parent: '2' });
		expect(cms.state.created[0].item.parent).toBe(2);
		await send({ ...good, parent: '404' });
		expect(cms.state.created[1].item.parent).toBeNull();
	});

	test('a filled honeypot looks like success but saves nothing', async () => {
		expect(await send({ ...good, website: 'spam.example' })).toEqual({ sent: true });
		expect(cms.state.created).toEqual([]);
		expect(cms.state.calls).toEqual([]);
	});

	test.each([
		['no name', { name: '  ' }],
		['no content', { content: '\u0000' }],
		['a bad email', { email: 'not-an-email' }],
		['an email with spaces', { email: 'a b@c.d' }]
	])('%s is a 400 that keeps what was typed', async (_n, change) => {
		const res = await send({ ...good, ...change });
		expect(res.status).toBe(400);
		expect(res.data.error).toBe('Please fill in your name, a valid email and a comment.');
		expect(res.data.values.author_email).toBe(change.email ?? 'ada@example.com');
	});

	test.each([
		['name', { name: 'n'.repeat(101) }],
		['email', { email: `${'e'.repeat(195)}@x.com` }],
		['comment', { content: 'c'.repeat(5001) }]
	])('a %s that is too long is a 400', async (_n, change) => {
		const res = await send({ ...good, ...change });
		expect(res.status).toBe(400);
		expect(res.data.error).toBe('That comment is too long.');
	});

	test('limits are inclusive', async () => {
		expect(await send({ ...good, name: 'n'.repeat(100), content: 'c'.repeat(5000) })).toEqual({ sent: true });
	});

	test.each([['TURNSTILE_SECRET_KEY'], ['DIRECTUS_COMMENTS_TOKEN']])(
		'without %s comments cannot be posted',
		async (key) => {
			env[/** @type {'TURNSTILE_SECRET_KEY'} */ (key)] = undefined;
			const res = await send(good);
			expect(res.status).toBe(503);
			expect(errors.mock.calls[0][0]).toMatch(/^Comments are not configured/);
		}
	);

	test('a missing spam-check token is a 400', async () => {
		const res = await send({ ...good, 'cf-turnstile-response': '' });
		expect(res.status).toBe(400);
		expect(res.data.error).toMatch(/spam check didn’t run/);
	});

	test('an unreachable spam check is a 503', async () => {
		cms.state.turnstile = new Error('offline');
		const res = await send(good);
		expect(res.status).toBe(503);
		expect(res.data.error).toMatch(/couldn’t be reached/);
	});

	test('a failed spam check is a 400', async () => {
		cms.state.turnstile = { success: false };
		const res = await send(good);
		expect(res.status).toBe(400);
		expect(res.data.error).toBe('The spam check didn’t pass. Please try again.');
	});

	test('comments closed, or no such post, is a 404', async () => {
		expect((await send(good, { slug: 'post-2' })).status).toBe(404);
		expect((await send(good, { slug: 'nope' })).status).toBe(404);
	});

	test('a CMS failure while saving is a 500', async () => {
		cms.state.fail.add('create:comments');
		const res = await send(good);
		expect(res.status).toBe(500);
		expect(errors).toHaveBeenCalledWith('Comment not saved', expect.anything());

		cms.state.fail.delete('create:comments');
		cms.state.fail.add('posts');
		expect((await send(good)).status).toBe(500);
	});

	test('a thrown non-Error is logged as it is', async () => {
		const real = cms;
		cms = /** @type {any} */ (
			Object.assign(
				async (/** @type {any} */ input, /** @type {any} */ init) => {
					if (String(input).startsWith('https://cms.alexwang.net/items/posts')) throw 'down';
					return real(input, init);
				},
				{ state: real.state }
			)
		);
		expect((await send(good)).status).toBe(500);
		expect(errors.mock.calls.at(-1)).toEqual(['Comment not saved', expect.anything()]);
	});
});

describe('other pages', () => {
	test('LinkedIn and the old portfolio redirect', async () => {
		const a = await thrown(() => linkedin.load());
		expect([a.status, a.location]).toEqual([302, 'https://linkedin.com/in/alex-y-wang']);
		const b = await thrown(() => portfolio.load());
		expect([b.status, b.location]).toEqual([302, '/projects']);
	});

	test('links', async () => {
		const data = /** @type {any} */ (await links.load(ev('/links')));
		expect(data.title).toBe('Links');
		expect(data.links).toHaveLength(2);
		expect(data.socials).toHaveLength(1);
		cms.state.graphql = false;
		cms.state.fail.add('links');
		await expect(links.load(ev('/links'))).rejects.toBeTruthy();
	});

	test('projects, most recent first, with short excerpts', async () => {
		cms.state.collections.projects[1].content_html = `<p>${'word '.repeat(60)}</p>`;
		const data = /** @type {any} */ (await projects.load(ev('/projects')));
		expect(data.title).toBe('Projects');
		expect(data.projects.map((/** @type {any} */ p) => p.slug)).toEqual(['transit-map', 'home-lab', 'old-site']);
		expect(data.projects[1].excerpt.length).toBeLessThanOrEqual(151);
		expect(data.projects[1].excerpt.endsWith('…')).toBe(true);
	});

	test('a project knows its place on the line', async () => {
		const mid = /** @type {any} */ (await project.load(ev('/project/home-lab', { project: 'home-lab' })));
		expect(mid).toEqual(
			expect.objectContaining({ index: 1, total: 3, title: 'Home lab' })
		);
		expect(mid.prev.slug).toBe('transit-map');
		expect(mid.next.slug).toBe('old-site');
		expect(mid.route).toEqual([
			{ slug: 'transit-map', title: 'Transit map' },
			{ slug: 'home-lab', title: 'Home lab' },
			{ slug: 'old-site', title: 'Old site' }
		]);
		const first = /** @type {any} */ (await project.load(ev('/project/transit-map', { project: 'transit-map' })));
		expect([first.prev, first.next.slug]).toEqual([null, 'home-lab']);
		const last = /** @type {any} */ (await project.load(ev('/project/old-site', { project: 'old-site' })));
		expect([last.prev.slug, last.next]).toEqual(['home-lab', null]);
	});

	test('a project missing from the line has no neighbours', async () => {
		const real = cms;
		cms = /** @type {any} */ (
			Object.assign(
				async (/** @type {any} */ input, /** @type {any} */ init) => {
					const res = await real(input, init);
					const body = await res.json();
					body.data.all = [];
					return Response.json(body);
				},
				{ state: real.state }
			)
		);
		const data = /** @type {any} */ (await project.load(ev('/project/home-lab', { project: 'home-lab' })));
		expect([data.index, data.prev, data.next]).toEqual([-1, null, null]);
	});

	test('an unknown project is a 404', async () => {
		const e = await thrown(() => project.load(ev('/project/nope', { project: 'nope' })));
		expect(isHttpError(e, 404)).toBe(true);
	});

	test('a CMS page offers the next page, wrapping round', async () => {
		const now = /** @type {any} */ (await cmsPage.load(ev('/now', { slug: 'now' })));
		expect(now.title).toBe('Now');
		expect(now.next.slug).toBe('i-like');
		const like = /** @type {any} */ (await cmsPage.load(ev('/i-like', { slug: 'i-like' })));
		expect(like.next.slug).toBe('now');
	});

	test('a lone CMS page has no next page', async () => {
		cms.state.collections.pages = [cms.state.collections.pages[0]];
		expect((/** @type {any} */ (await cmsPage.load(ev('/now', { slug: 'now' })))).next).toBeNull();
	});

	test('an unknown CMS page is a 404', async () => {
		const e = await thrown(() => cmsPage.load(ev('/nope', { slug: 'nope' })));
		expect(isHttpError(e, 404)).toBe(true);
	});

	test('a CMS page missing from the list has no next page', async () => {
		const real = cms;
		cms = /** @type {any} */ (
			Object.assign(
				async (/** @type {any} */ input, /** @type {any} */ init) => {
					const res = await real(input, init);
					const body = await res.json();
					body.data.all = [{ slug: 'a' }, { slug: 'b' }];
					return Response.json(body);
				},
				{ state: real.state }
			)
		);
		expect((/** @type {any} */ (await cmsPage.load(ev('/now', { slug: 'now' })))).next).toBeNull();
	});

	test('the SSH key page', async () => {
		expect(await sshkey.load()).toEqual({ title: 'SSH Key' });
	});
});
