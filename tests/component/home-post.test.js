import { describe, expect, test, vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/svelte';
import { tick } from 'svelte';
import { browser } from '../setup/dom.js';
import { goto } from '../helpers/app.svelte.js';

vi.mock('#lib/network.js', () => ({ startNetwork: vi.fn(() => null) }));
vi.mock('../../src/lib/tower.js', () => ({ startTower: vi.fn(() => null) }));
const animate = vi.hoisted(() => vi.fn());
vi.mock('motion', async (importOriginal) => ({
	.../** @type {any} */ (await importOriginal()),
	animate
}));

import Home from '../../src/routes/+page.svelte';
import Post from '../../src/routes/blog/[slug]/+page.svelte';

describe('home', () => {
	const full = () => ({
		config: {
			lead_text: 'I build things.',
			links_profile_picture: 'me',
			homepage_welcome_text: '<p>Hello <strong>there</strong></p>'
		},
		posts: [
			{
				slug: 'p1',
				title: 'First post',
				date_published: '2025-01-01',
				category: null,
				minutes: 2,
				excerpt: '',
				featured_image: null,
				redirect_url: null
			}
		],
		projects: [
			{
				slug: 'map',
				title: 'Map',
				start_date: '2024-02-01',
				end_date: null,
				image: 'i1',
				url: 'https://www.map.example/x',
				excerpt: 'A map.'
			},
			{
				slug: 'lab',
				title: 'Lab',
				start_date: '2022-01-01',
				end_date: '2023-01-01',
				image: null,
				url: 'bad url',
				excerpt: ''
			},
			{
				slug: 'old',
				title: 'Old',
				start_date: null,
				end_date: '2020-01-01',
				image: null,
				url: null,
				excerpt: ''
			}
		],
		employments: [
			{
				start_date: '2023-01-01',
				end_date: null,
				title: 'Engineer',
				employer_name: 'Rail Co',
				employer_url: 'https://rail.example',
				location: 'Remote',
				description: 'Built trains.\r\n\r\nFixed signals.'
			},
			{
				start_date: '2020-01-01',
				end_date: '2022-12-01',
				title: null,
				employer_name: 'Bus Co',
				employer_url: null,
				location: null,
				description: null
			}
		],
		educations: [
			{
				start_date: '2016-09-01',
				end_date: '2020-06-01',
				institution_name: 'University',
				degree_name: 'BSc',
				description: 'Studied.'
			},
			{
				start_date: null,
				end_date: null,
				institution_name: 'School',
				degree_name: null,
				description: null
			}
		],
		certifications: [{ name: 'Cert', reference: 'ABC', date: '2024-05-01', image: 'c1' }],
		recognitions: [{ name: 'Award', image: 'r1', description: 'For trains', date: '2023-01-01' }],
		socials: [{ name: 'GitHub', url: 'https://github.com/x', icon: 'fa-github' }]
	});

	test('everything the CMS has, in order', async () => {
		render(Home, { data: full() });
		await tick();
		expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Alex Wang');
		expect(document.body).toHaveTextContent('I build things.');
		const doors = within(screen.getByRole('navigation', { name: 'Sections' })).getAllByRole('link');
		expect(doors[0]).toHaveTextContent('Currently: Engineer at Rail Co');
		expect(doors[1]).toHaveTextContent('Latest: First post');
		expect(doors[2]).toHaveTextContent('Email, LinkedIn and elsewhere');
		expect(screen.getByRole('region', { name: 'About' })).toHaveTextContent('Hello there');

		const work = screen.getByRole('region', { name: 'Work' });
		expect(within(work).getByRole('heading', { name: 'Employment' })).toBeInTheDocument();
		expect(within(work).getByRole('link', { name: 'Rail Co' })).toHaveAttribute(
			'href',
			'https://rail.example'
		);
		expect(work).toHaveTextContent('Built trains.');
		expect(work).toHaveTextContent('Fixed signals.');
		expect(work).toHaveTextContent('Bus Co');
		expect(within(work).getByRole('heading', { name: 'Education' })).toBeInTheDocument();
		expect(work).toHaveTextContent('BSc');
		expect(within(work).getByRole('link', { name: /map\.example/ })).toHaveAttribute(
			'href',
			'https://www.map.example/x'
		);
		expect(within(work).getByRole('link', { name: /View project/ })).toHaveAttribute(
			'href',
			'bad url'
		);
		expect(within(work).getByRole('link', { name: /All projects/ })).toHaveAttribute(
			'href',
			'/projects'
		);
		expect(within(work).getByText('Certifications').closest('details')).toHaveAttribute('open');
		expect(work).toHaveTextContent('ABC · 05/2024');
		expect(work).toHaveTextContent('For trains');

		expect(
			within(screen.getByRole('region', { name: 'Writing' })).getByRole('link', {
				name: /First post/
			})
		).toBeInTheDocument();
		const contact = screen.getByRole('region', { name: 'Contact' });
		expect(within(contact).getByRole('link', { name: 'alex@alexwang.net' })).toHaveAttribute(
			'href',
			'mailto:alex@alexwang.net'
		);
		expect(within(contact).getByRole('link', { name: 'GitHub' })).toBeInTheDocument();

		const shortcuts = within(
			screen.getByRole('complementary', { name: 'Page shortcuts' })
		).getAllByRole('link');
		expect(shortcuts.map((a) => a.textContent?.trim())).toEqual([
			'About',
			'Work',
			'Employment',
			'Education',
			'Projects',
			'Certifications',
			'Recognition',
			'Writing',
			'Beyond work',
			'Contact'
		]);
	});

	test('the photo falls back to the size the CMS always serves', async () => {
		render(Home, { data: full() });
		const img = /** @type {HTMLImageElement} */ (screen.getByRole('img', { name: 'Alex Wang' }));
		expect(img.src).toMatch(/width=600$/);
		await fireEvent.error(img);
		expect(img.src).toMatch(/width=1200$/);
		await fireEvent.error(img);
		expect(img.src).toMatch(/width=1200$/);
	});

	test('a sparse CMS: no current job, no posts, no extras', () => {
		const data = full();
		data.config = { lead_text: '', links_profile_picture: null, homepage_welcome_text: '' };
		data.employments = [{ ...data.employments[1] }];
		data.posts = [];
		data.educations = [];
		data.certifications = [];
		data.recognitions = [];
		render(Home, { data });
		const doors = within(screen.getByRole('navigation', { name: 'Sections' })).getAllByRole('link');
		expect(doors[0]).toHaveTextContent('Latest: Map, 02/2024');
		expect(doors[1]).toHaveTextContent('Posts from the blog');
		expect(screen.queryByRole('img', { name: 'Alex Wang' })).toBeNull();
		expect(screen.queryByRole('region', { name: 'About' })).toBeNull();
		expect(screen.queryByText('Certifications')).toBeNull();
		expect(document.body).toHaveTextContent('No posts to show right now.');
		const shortcuts = within(
			screen.getByRole('complementary', { name: 'Page shortcuts' })
		).getAllByRole('link');
		expect(shortcuts[0]).toHaveTextContent('Work');
	});

	test('a current job without a title, and no projects at all', () => {
		const data = full();
		data.employments = [{ ...data.employments[0], title: null }];
		render(Home, { data });
		expect(
			within(screen.getByRole('navigation', { name: 'Sections' })).getAllByRole('link')[0]
		).toHaveTextContent('Currently: at Rail Co');

		const none = full();
		none.employments = [];
		none.projects = [];
		render(Home, { data: none });
		expect(
			within(screen.getAllByRole('navigation', { name: 'Sections' })[1]).getAllByRole('link')[0]
		).toHaveTextContent('Selected projects');
	});

	test('a link to a folded section opens it again', async () => {
		const { unmount } = render(Home, { data: full() });
		const certs = /** @type {HTMLDetailsElement} */ (
			document.getElementById('work-certifications')
		);
		certs.open = false;
		location.hash = '#work-certifications';
		window.dispatchEvent(new HashChangeEvent('hashchange'));
		expect(certs.open).toBe(true);
		location.hash = '#work';
		window.dispatchEvent(new HashChangeEvent('hashchange'));
		unmount();
		location.hash = '';
	});
});

describe('a post', () => {
	const data = (/** @type {any} */ over = {}) => ({
		post: {
			slug: 'p2',
			title: 'Second <post>',
			date_published: '2025-12-27T10:00:00',
			featured_image: 'img',
			comments_enabled: true,
			categories: [{ name: 'Travel', slug: 'travel', is_primary: true }],
			tags: [{ name: 'Rail', slug: 'rail' }],
			...over.post
		},
		body: '<h2 id="one">One</h2><p>a</p><h2 id="two">Two</h2><p>b</p>',
		headings: [
			{ id: 'one', text: 'One', before: 0 },
			{ id: 'two', text: 'Two', before: 440 }
		],
		minutes: 4,
		words: 880,
		older: { slug: 'p3', title: 'Third', date_published: '2025-12-26', featured_image: null },
		newer: { slug: 'p1', title: 'First', date_published: '2025-12-28', featured_image: 'n' },
		comments: [
			{ id: 1, parent: null, author_name: 'Ada', content: 'Hi', date_created: '2025-12-29' }
		],
		turnstileSiteKey: '',
		description: 'About the second post',
		image: 'https://cms.alexwang.net/assets/img',
		...over,
		...(over.post ? { post: { ...over.post, ...{} } } : {})
	});
	const build = (/** @type {any} */ over = {}) => {
		const d = data(over);
		if (over.post) d.post = { ...data().post, ...over.post };
		return d;
	};

	test('the post, its metadata and structured data', () => {
		render(Post, { data: build() });
		expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Second <post>');
		expect(document.body).toHaveTextContent('December 27, 2025 · 4 min ride · 2 stops');
		expect(screen.getAllByRole('link', { name: 'Travel' })[0]).toHaveAttribute(
			'href',
			'/blog/category/travel'
		);
		expect(screen.getAllByRole('link', { name: /Comments \(1\)/ }).length).toBeGreaterThan(0);
		expect(screen.getByRole('region', { name: 'Comments (1)' })).toHaveTextContent('Ada');
		expect(screen.getAllByRole('list', { name: 'Tags' }).length).toBeGreaterThan(0);
		const ld = JSON.parse(
			/** @type {string} */ (
				document.head.querySelector('script[type="application/ld+json"]')?.textContent
			).replace(/\\u003c/g, '<')
		);
		expect(ld).toMatchObject({
			'@type': 'BlogPosting',
			headline: 'Second <post>',
			image: ['https://cms.alexwang.net/assets/img'],
			keywords: 'Rail',
			articleSection: 'Travel'
		});
		expect(document.head.innerHTML).not.toContain('Second <post>","');
		expect(document.head.querySelector('meta[property="article:section"]')).toHaveAttribute(
			'content',
			'Travel'
		);
		expect(document.head.querySelector('meta[property="article:tag"]')).toHaveAttribute(
			'content',
			'Rail'
		);
		expect(screen.getByRole('link', { name: /Previous stop/ })).toHaveAttribute('href', '/blog/p1');
		expect(screen.getByRole('link', { name: /Next stop/ })).toHaveAttribute('href', '/blog/p3');
	});

	test('a bare post: no picture, category, tags, comments, stops or older post', () => {
		render(Post, {
			data: build({
				post: { featured_image: null, comments_enabled: false, categories: [], tags: [] },
				headings: [],
				older: null,
				newer: null,
				image: null,
				comments: []
			})
		});
		expect(document.body).toHaveTextContent('· 4 min ride');
		expect(document.body).not.toHaveTextContent('stops');
		expect(screen.queryByRole('region', { name: /Comments/ })).toBeNull();
		expect(screen.queryByRole('list', { name: 'Tags' })).toBeNull();
		expect(screen.getByRole('link', { name: /End of the line/ })).toHaveAttribute('href', '/blog');
		expect(document.head.querySelector('meta[property="article:section"]')).toBeNull();
		const ld = JSON.parse(
			/** @type {string} */ (
				document.head.querySelector('script[type="application/ld+json"]')?.textContent
			)
		);
		expect(ld.image).toBeUndefined();
		expect(ld.keywords).toBeUndefined();
	});

	test('one stop, and comments that failed to load', () => {
		render(Post, {
			data: build({ headings: [{ id: 'one', text: 'One', before: 0 }], comments: null })
		});
		expect(document.body).toHaveTextContent('1 stop');
		expect(screen.getAllByRole('link', { name: 'Comments' }).length).toBeGreaterThan(0);
	});

	test('the ride follows the reader from departure to arrival', async () => {
		const { container } = render(Post, { data: build() });
		const status = () =>
			/** @type {HTMLElement} */ (
				container.querySelector('aside p.t-meta, .t-meta.tabular-nums.mt-3')
			)?.textContent?.trim();
		const bar = /** @type {HTMLElement} */ (container.querySelector('.bar'));
		expect(status()).toBe('2 stops · 4 min');
		expect(bar).not.toHaveClass('shown');

		const top = /** @type {Element} */ (document.getElementById('post-top'));
		browser.intersect(top, {
			isIntersecting: false,
			boundingClientRect: /** @type {any} */ ({ bottom: -10 })
		});
		await tick();
		expect(bar).toHaveClass('shown');

		browser.intersect(/** @type {Element} */ (document.getElementById('one')));
		await tick();
		expect(status()).toBe('Stop 1 of 2 · 4 min left');
		browser.intersect(/** @type {Element} */ (document.getElementById('two')), {
			isIntersecting: false,
			boundingClientRect: /** @type {any} */ ({ bottom: -5 })
		});
		await tick();
		expect(status()).toBe('Stop 2 of 2 · 2 min left');
		browser.intersect(/** @type {Element} */ (document.getElementById('two')), {
			isIntersecting: false,
			boundingClientRect: /** @type {any} */ ({ bottom: 400 })
		});
		await tick();
		expect(status()).toBe('Stop 1 of 2 · 4 min left');

		const end = /** @type {Element} */ (container.querySelector('.post-body + span[aria-hidden]'));
		browser.intersect(end);
		await tick();
		expect(status()).toBe('Arrived');

		// the closing station comes into view: the bar steps aside and the ring pulses, once
		const next = /** @type {Element} */ (document.getElementById('next'));
		browser.intersect(next);
		await tick();
		expect(bar).not.toHaveClass('shown');
		expect(animate).toHaveBeenCalledTimes(1);
		browser.intersect(next, { isIntersecting: false });
		await tick();
		browser.intersect(next);
		await tick();
		expect(animate).toHaveBeenCalledTimes(1);
	});

	test('a minute is always left until arrival', async () => {
		render(Post, {
			data: build({ words: 450, minutes: 2, headings: [{ id: 'one', text: 'One', before: 449 }] })
		});
		browser.intersect(/** @type {Element} */ (document.getElementById('one')));
		await tick();
		expect(document.body).toHaveTextContent('Stop 1 of 1 · 1 min left');
	});

	test('under reduced motion the closing ring does not pulse', async () => {
		browser.media.reduce = true;
		animate.mockClear();
		render(Post, { data: build() });
		browser.intersect(/** @type {Element} */ (document.getElementById('next')));
		await tick();
		expect(animate).not.toHaveBeenCalled();
	});

	test('missing marks are not watched', async () => {
		animate.mockClear();
		const { container } = render(Post, { data: build({ body: '<p>no headings in the body</p>' }) });
		container.querySelector('#post-top')?.removeAttribute('id');
		await tick();
	});

	test('← goes to the newer post and → to the older one', async () => {
		render(Post, { data: build() });
		await fireEvent.keyDown(window, { key: 'ArrowLeft' });
		expect(goto).toHaveBeenLastCalledWith('/blog/p1');
		await fireEvent.keyDown(window, { key: 'ArrowRight' });
		expect(goto).toHaveBeenLastCalledWith('/blog/p3');
	});
});
