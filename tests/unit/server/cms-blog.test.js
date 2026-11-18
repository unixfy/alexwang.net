import { describe, expect, test, vi } from 'vitest';
import { collections } from '#lib/cms.js';
import {
	archive,
	asset,
	categoriesOf,
	listPosts,
	pageOf,
	readingMinutes,
	scopeFilter,
	toCard,
	visible,
	PER_PAGE
} from '#lib/blog.js';
import getDirectusInstance from '#lib/directus.js';
import { fakeCms } from '../../helpers/cms.js';
import { fixtures } from '../../helpers/fixtures.js';

const quiet = () => vi.spyOn(console, 'error').mockImplementation(() => {});

describe('collections', () => {
	test('asks for every spec in one GraphQL query', async () => {
		const cms = fakeCms({
			collections: {
				projects: [
					{ slug: 'a', image: 'img1' },
					{ slug: 'b', image: null }
				],
				pages: [{ slug: 'x' }]
			}
		});
		const out = await collections(cms, {
			projects: { collection: 'projects', fields: ['slug', 'image'], sort: 'sort', limit: -1 },
			found: {
				collection: 'pages',
				fields: ['slug', 'featured_image'],
				sort: ['-a', 'b'],
				limit: 1,
				filter: { _and: [{ slug: { _eq: 'x' } }, { n: { _in: [1, 'two', null, true] } }] }
			},
			missing: { collection: 'nothing', fields: ['id'] }
		});
		expect(cms.state.calls).toHaveLength(1);
		const { query } = JSON.parse(/** @type {string} */ (cms.state.calls[0].body));
		expect(query).toBe(
			'{ projects: projects(sort: ["sort"], limit: -1) { slug image { id } } ' +
				'found: pages(sort: ["-a","b"], limit: 1, filter: {_and: [{slug: {_eq: "x"}}, {n: {_in: [1, "two", null, true]}}]}) { slug featured_image { id } } ' +
				'missing: nothing { id } }'
		);
		// file objects come back as their ids, as REST would return them
		expect(out.projects).toEqual([
			{ slug: 'a', image: 'img1' },
			{ slug: 'b', image: null }
		]);
		expect(out.found).toEqual([{ slug: 'x' }]);
		expect(out.missing).toEqual([]);
	});

	test('a section absent from the answer is empty', async () => {
		const cms = vi.fn(async () => Response.json({ data: {} }));
		expect(
			await collections(/** @type {any} */ (cms), { a: { collection: 'a', fields: ['id'] } })
		).toEqual({ a: [] });
	});

	test.each([
		['GraphQL errors', () => Response.json({ errors: [{ message: 'bad field' }] })],
		['an HTTP error without a body message', () => Response.json({}, { status: 500 })],
		['no data', () => Response.json({})],
		['a network failure', () => Promise.reject(new Error('offline'))]
	])('after %s, each collection is asked for on its own', async (_name, graphql) => {
		const error = quiet();
		const rest = fakeCms({ collections: { links: [{ title: 'L' }], socials: [] } });
		/** @type {any} */
		const fetch = (/** @type {any} */ input, /** @type {any} */ init) =>
			String(input).endsWith('/graphql') ? graphql() : rest(input, init);
		const out = await collections(fetch, {
			links: {
				collection: 'links',
				fields: ['title'],
				sort: 'sort',
				limit: 5,
				filter: { a: { _eq: 1 } }
			},
			socials: { collection: 'socials', fields: ['name'] }
		});
		expect(out).toEqual({ links: [{ title: 'L' }], socials: [] });
		expect(error.mock.calls[0][0]).toMatch(/^Directus combined query failed, asking one by one: /);
		const [links, socials] = rest.state.calls.map((c) => new URL(c.url));
		expect(links.searchParams.get('sort')).toBe('sort');
		expect(links.searchParams.get('limit')).toBe('5');
		expect(JSON.parse(/** @type {string} */ (links.searchParams.get('filter')))).toEqual({
			a: { _eq: 1 }
		});
		expect(socials.searchParams.has('sort')).toBe(false);
		expect(socials.searchParams.has('limit')).toBe(false);
		expect(socials.searchParams.has('filter')).toBe(false);
	});

	test('one broken collection leaves only itself empty', async () => {
		const error = quiet();
		const cms = fakeCms({
			graphql: false,
			fail: new Set(['socials']),
			collections: { links: [{ t: 1 }] }
		});
		const out = await collections(cms, {
			links: { collection: 'links', fields: ['t'] },
			socials: { collection: 'socials', fields: ['t'] }
		});
		expect(out).toEqual({ links: [{ t: 1 }], socials: [] });
		expect(error.mock.calls.at(-1)?.[0]).toBe(
			'Directus socials unavailable: socials is unavailable'
		);
	});

	test('a required collection that fails fails the whole call', async () => {
		quiet();
		const cms = fakeCms({ graphql: false, fail: new Set(['links']) });
		await expect(
			collections(cms, { links: { collection: 'links', fields: ['t'], required: true } })
		).rejects.toMatchObject({ errors: [{ message: 'links is unavailable' }] });
	});
});

describe('blog helpers', () => {
	test('visible: published and not scheduled', () => {
		expect(visible()).toEqual({
			_and: [
				{ status: { _eq: 'published' } },
				{ _or: [{ date_published: { _null: true } }, { date_published: { _lte: '$NOW' } }] }
			]
		});
		expect(visible()).not.toBe(visible());
	});

	test('asset', () => {
		expect(asset('abc')).toBe('https://cms.alexwang.net/assets/abc?format=webp&width=1200');
		expect(asset('abc', 400)).toBe('https://cms.alexwang.net/assets/abc?format=webp&width=400');
		expect(asset(null)).toBeNull();
		expect(asset('')).toBeNull();
	});

	test('categoriesOf puts the primary first and skips broken junction rows', () => {
		expect(
			categoriesOf({
				categories: [
					{ is_primary: false, categories_id: { name: 'B', slug: 'b' } },
					{ is_primary: null, categories_id: null },
					{ is_primary: 1, categories_id: { name: 'A', slug: 'a' } }
				]
			})
		).toEqual([
			{ is_primary: true, name: 'A', slug: 'a' },
			{ is_primary: false, name: 'B', slug: 'b' }
		]);
		expect(categoriesOf({})).toEqual([]);
	});

	test('readingMinutes is at least one', () => {
		expect(readingMinutes(0)).toBe(1);
		expect(readingMinutes(109)).toBe(1);
		expect(readingMinutes(330)).toBe(2);
		expect(readingMinutes(2200)).toBe(10);
	});

	test('toCard: summary, then SEO description, then the body', () => {
		const content = { blocks: [{ type: 'paragraph', data: { text: 'Body &amp; words here' } }] };
		const base = {
			title: 'T',
			slug: 's',
			categories: [{ is_primary: true, categories_id: { name: 'C', slug: 'c' } }]
		};
		const a = toCard({ ...base, excerpt: '<p>Mine</p>', seo_description: 'SEO', content });
		expect(a).toEqual({
			title: 'T',
			slug: 's',
			excerpt: 'Mine',
			category: { is_primary: true, name: 'C', slug: 'c' },
			minutes: 1
		});
		expect(toCard({ ...base, excerpt: null, seo_description: 'SEO', content }).excerpt).toBe('SEO');
		const c = toCard({ title: 'T', slug: 's', content });
		expect(c.excerpt).toBe('Body & words here');
		expect(c.category).toBeNull();
		expect(toCard({ title: 'T', slug: 's' }).excerpt).toBe('');
	});

	test('pageOf', () => {
		const at = (/** @type {string} */ q) => pageOf(new URL(`https://x/${q}`));
		expect(at('')).toBe(1);
		expect(at('?page=3')).toBe(3);
		expect(at('?page=0')).toBe(1);
		expect(at('?page=-2')).toBe(1);
		expect(at('?page=abc')).toBe(1);
		expect(at('?page=2.9')).toBe(2);
		expect(at('?page=99999')).toBe(1000);
	});

	test('scopeFilter', () => {
		expect(scopeFilter({})).toBeUndefined();
		expect(scopeFilter({ category: null, tag: null })).toBeUndefined();
		expect(scopeFilter({ category: 'c' })).toEqual({
			_and: [{ categories: { categories_id: { slug: { _eq: 'c' } } } }]
		});
		expect(scopeFilter({ category: 'c', tag: 't' })?._and).toHaveLength(2);
	});
});

describe('listPosts', () => {
	const { collections: data } = fixtures();

	test('a page of cards, newest first, with whether an older page exists', async () => {
		const cms = fakeCms({ collections: data });
		const first = await listPosts(getDirectusInstance(cms), {});
		expect(first.page).toBe(1);
		expect(first.posts).toHaveLength(PER_PAGE);
		expect(first.hasOlder).toBe(true);
		expect(first.posts[0].slug).toBe('post-1');
		expect(first.posts[0]).not.toHaveProperty('content');
		const url = new URL(cms.state.calls[0].url);
		expect(url.searchParams.get('limit')).toBe(String(PER_PAGE + 1));
		expect(url.searchParams.get('offset')).toBe('0');
		expect(url.searchParams.has('search')).toBe(false);

		const last = await listPosts(getDirectusInstance(cms), { page: 3 });
		expect(last.posts).toHaveLength(4);
		expect(last.hasOlder).toBe(false);
	});

	test('a filter is combined with visibility; a search is passed on', async () => {
		const cms = fakeCms({ collections: data });
		await listPosts(getDirectusInstance(cms), { perPage: 2, filter: { a: 1 }, search: 'post-2' });
		const url = new URL(cms.state.calls[0].url);
		expect(JSON.parse(/** @type {string} */ (url.searchParams.get('filter')))).toEqual({
			_and: [visible(), { a: 1 }]
		});
		expect(url.searchParams.get('search')).toBe('post-2');
	});
});

describe('archive', () => {
	const { collections: data } = fixtures();

	test('posts and categories together, plus extras', async () => {
		const cms = fakeCms({ collections: data });
		const out = await archive(
			cms,
			new URL('https://x/blog'),
			{},
			{
				tags: { collection: 'tags', fields: ['name', 'slug'] }
			}
		);
		expect(out.posts).toHaveLength(PER_PAGE);
		expect(out.categories.map((c) => c.slug)).toEqual(['technology', 'travel']);
		expect(out.tags).toHaveLength(2);
	});

	test('a search and a scope reach the posts query', async () => {
		const cms = fakeCms({ collections: data });
		await archive(cms, new URL('https://x/blog'), { q: 'post-2', tag: 'rail' });
		const posts = new URL(
			/** @type {string} */ (cms.state.calls.find((c) => c.url.includes('/items/posts'))?.url)
		);
		expect(posts.searchParams.get('search')).toBe('post-2');
		expect(posts.searchParams.get('filter')).toContain('"tags"');
	});

	test('a later page with no posts is a 404; the first page may be empty', async () => {
		const cms = fakeCms({ collections: { ...data, posts: [] } });
		await expect(archive(cms, new URL('https://x/blog?page=2'))).rejects.toMatchObject({
			status: 404
		});
		expect((await archive(cms, new URL('https://x/blog'))).posts).toEqual([]);
	});
});
