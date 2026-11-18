import { describe, expect, test, vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/svelte';
import { tick } from 'svelte';
import { browser } from '../setup/dom.js';
import { html } from '../helpers/snippet.js';
import { page, goto, navigateHooks } from '../helpers/app.svelte.js';

vi.mock('#lib/network.js', () => ({ startNetwork: vi.fn(() => null) }));
vi.mock('../../src/lib/tower.js', () => ({ startTower: vi.fn(() => null) }));
// a production build in the browser
vi.mock('$app/env', () => ({ browser: true, dev: false, building: false, version: 'test' }));

import BlogArchive from '#lib/BlogArchive.svelte';
import Layout from '../../src/routes/+layout.svelte';
import ErrorPage from '../../src/routes/+error.svelte';
import SshKey from '../../src/routes/sshkey/+page.svelte';
import Links from '../../src/routes/links/+page.svelte';
import Projects from '../../src/routes/projects/+page.svelte';
import Project from '../../src/routes/project/[project]/+page.svelte';
import CmsPage from '../../src/routes/[slug]/+page.svelte';
import Blog from '../../src/routes/blog/+page.svelte';
import Category from '../../src/routes/blog/category/[slug]/+page.svelte';
import Tag from '../../src/routes/blog/tag/[slug]/+page.svelte';

const config = {
	banner_enabled: false,
	banner_content: '',
	sshkey: '',
	links_profile_picture: null
};
const meta = (/** @type {string} */ sel) =>
	document.head.querySelector(sel)?.getAttribute('content');

describe('layout', () => {
	test('title, description, social cards and the canonical address', async () => {
		page.data = { title: 'Blog', description: 'Writing.', robots: 'noindex' };
		page.url = new URL('https://alexwang.net/blog?page=3&q=x');
		render(Layout, { data: { config }, children: html('<p>page body</p>') });
		await tick();
		expect(document.title).toBe('Blog | Alex Wang');
		expect(meta('meta[name=description]')).toBe('Writing.');
		expect(meta('meta[name=robots]')).toBe('noindex');
		expect(document.head.querySelector('link[rel=canonical]')).toHaveAttribute(
			'href',
			'https://alexwang.net/blog?page=3'
		);
		expect(meta('meta[property="og:image"]')).toBe('https://alexwang.net/og.png');
		expect(meta('meta[property="og:image:width"]')).toBe('1200');
		expect(meta('meta[property="og:type"]')).toBe('website');
		expect(screen.getByRole('main')).toHaveTextContent('page body');
		expect(screen.getByRole('link', { name: 'Skip to content' })).toHaveAttribute('href', '#main');
		expect(screen.queryByRole('status')).toBeNull();
	});

	test('defaults, the home page address, an article image, and errors', async () => {
		page.data = { image: 'https://cms/x.png', ogType: 'article' };
		page.url = new URL('https://alexwang.net/?page=2');
		const { unmount } = render(Layout, { data: { config }, children: html('x') });
		await tick();
		expect(document.title).toBe('Welcome | Alex Wang');
		expect(meta('meta[name=description]')).toBe("Alex Wang's portfolio site");
		expect(document.head.querySelector('link[rel=canonical]')).toHaveAttribute(
			'href',
			'https://alexwang.net'
		);
		expect(meta('meta[property="og:image"]')).toBe('https://cms/x.png');
		expect(document.head.querySelector('meta[property="og:image:width"]')).toBeNull();
		expect(meta('meta[property="og:type"]')).toBe('article');
		expect(document.head.querySelector('meta[name=robots]')).toBeNull();
		unmount();

		page.error = { message: 'x' };
		page.url = new URL('https://alexwang.net/projects?page=2');
		render(Layout, { data: { config }, children: html('x') });
		await tick();
		expect(document.title).toBe('Error | Alex Wang');
		expect(document.head.querySelector('link[rel=canonical]')).toHaveAttribute(
			'href',
			'https://alexwang.net/projects'
		);
	});

	test('a production build links the web app manifest', () => {
		render(Layout, { data: { config }, children: html('x') });
		expect(document.head.querySelector('link[rel=manifest]')).toHaveAttribute(
			'href',
			'/manifest.webmanifest'
		);
	});

	test('a new page fades in', async () => {
		render(Layout, { data: { config }, children: html('<p>first</p>') });
		const animate = vi.mocked(Element.prototype.animate);
		animate.mockClear();
		page.url = new URL('https://alexwang.net/elsewhere');
		await tick();
		expect(animate).toHaveBeenCalled();
		expect(animate.mock.lastCall?.[1]).toMatchObject({ duration: 200 });
	});

	test('under reduced motion a new page appears without a fade', async () => {
		browser.media.reduce = true;
		render(Layout, { data: { config }, children: html('<p>first</p>') });
		const animate = vi.mocked(Element.prototype.animate);
		animate.mockClear();
		page.url = new URL('https://alexwang.net/elsewhere');
		await tick();
		expect(animate.mock.calls.every((c) => c[1]?.duration === 0)).toBe(true);
	});

	test('a banner from the CMS', () => {
		render(Layout, {
			data: {
				config: { ...config, banner_enabled: true, banner_content: 'Hello <a href="/x">there</a>' }
			},
			children: html('x')
		});
		expect(screen.getByRole('status')).toHaveTextContent('Hello there');
	});

	test('navigation cross-fades with a view transition where there is one', async () => {
		const start = vi.fn(async (/** @type {() => Promise<void>} */ cb) => cb());
		Object.defineProperty(document, 'startViewTransition', { configurable: true, value: start });
		render(Layout, { data: { config }, children: html('x') });
		const done = navigateHooks[0]({ complete: Promise.resolve() });
		expect(start).toHaveBeenCalled();
		await done;
		// @ts-ignore
		delete document.startViewTransition;
	});

	test('without view transitions, or under reduced motion, navigation is left alone', () => {
		render(Layout, { data: { config }, children: html('x') });
		expect(navigateHooks[0]({ complete: Promise.resolve() })).toBeUndefined();
		browser.media.reduce = true;
		Object.defineProperty(document, 'startViewTransition', { configurable: true, value: vi.fn() });
		render(Layout, { data: { config }, children: html('x') });
		expect(navigateHooks[1]({ complete: Promise.resolve() })).toBeUndefined();
		// @ts-ignore
		delete document.startViewTransition;
	});
});

describe('error page', () => {
	test('a missing page', () => {
		page.status = 404;
		render(ErrorPage);
		expect(screen.getByRole('heading')).toHaveTextContent('This stop isn’t on the line.');
	});
	test('a server error', () => {
		page.status = 500;
		render(ErrorPage);
		expect(screen.getByRole('heading')).toHaveTextContent('Service interrupted.');
		expect(screen.getByRole('link', { name: 'Back to the start' })).toHaveAttribute('href', '/');
	});
});

describe('SSH key and links', () => {
	test('the key with a copy button, or a note when it is missing', async () => {
		const writeText = vi.fn(async () => {});
		Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } });
		const { unmount } = render(SshKey, { data: { config: { sshkey: 'ssh-ed25519 AAA' } } });
		expect(screen.getByText('ssh-ed25519 AAA')).toBeInTheDocument();
		await fireEvent.click(screen.getByRole('button', { name: /Copy/ }));
		expect(writeText).toHaveBeenCalledWith('ssh-ed25519 AAA');
		unmount();
		render(SshKey, { data: { config: { sshkey: '' } } });
		expect(screen.getByRole('alert')).toHaveTextContent('The key isn’t available right now.');
		expect(screen.queryByRole('button')).toBeNull();
	});

	test('links, with and without a picture and icons', () => {
		const data = {
			config: { links_profile_picture: 'pic' },
			links: [
				{ title: 'Site', url: 'https://a.example', icon: 'fa-globe' },
				{ title: 'Blog', url: 'https://b.example', icon: null }
			],
			socials: [{ name: 'GitHub', url: 'https://github.com/x', icon: 'fa-github' }]
		};
		const { unmount } = render(Links, { data });
		expect(screen.getByRole('img', { name: 'Alex Wang' })).toHaveAttribute(
			'src',
			'//cms.alexwang.net/assets/pic?format=webp&width=200'
		);
		const site = screen.getByRole('link', { name: 'Site' });
		expect(site).toHaveAttribute('target', '_blank');
		expect(site.querySelector('.fa-globe')).not.toBeNull();
		expect(screen.getByRole('link', { name: 'Blog' }).querySelector('i')).toBeNull();
		expect(screen.getByRole('link', { name: 'GitHub' })).toHaveAttribute(
			'href',
			'https://github.com/x'
		);
		unmount();
		render(Links, { data: { ...data, config: { links_profile_picture: null } } });
		expect(screen.queryByRole('img')).toBeNull();
	});
});

describe('projects', () => {
	test('grouped by the year they ended, running ones under Present', () => {
		render(Projects, {
			data: {
				projects: [
					{
						slug: 'a',
						title: 'A',
						start_date: '2024-01-01',
						end_date: null,
						image: 'i',
						excerpt: 'About A'
					},
					{
						slug: 'b',
						title: 'B',
						start_date: '2021-01-01',
						end_date: '2022-06-01',
						image: null,
						excerpt: ''
					},
					{
						slug: 'c',
						title: 'C',
						start_date: null,
						end_date: '2022-01-01',
						image: null,
						excerpt: 'C!'
					}
				]
			}
		});
		const present = screen.getByRole('region', { name: 'Present' });
		expect(within(present).getByRole('link', { name: /A/ })).toHaveAttribute('href', '/project/a');
		expect(present.querySelector('img')).toHaveAttribute(
			'src',
			expect.stringContaining('/assets/i')
		);
		expect(present).toHaveTextContent('About A');
		const y2022 = screen.getByRole('region', { name: '2022' });
		expect(within(y2022).getAllByRole('link')).toHaveLength(2);
		expect(y2022).toHaveClass('station-end');
	});

	describe('a project', () => {
		const base = {
			project: {
				slug: 'b',
				title: 'B',
				start_date: '2021-01-01',
				end_date: null,
				image: 'img',
				url: 'https://www.b.example/x',
				content_html: '<p>Body</p>'
			},
			route: [
				{ slug: 'a', title: 'A' },
				{ slug: 'b', title: 'B' },
				{ slug: 'c', title: 'C' }
			],
			index: 1,
			total: 3,
			prev: { slug: 'a', title: 'A', image: null },
			next: { slug: 'c', title: 'C', image: 'ci' },
			title: 'B'
		};

		test('its place on the line, its write-up, and its neighbours', () => {
			render(Project, { data: base });
			expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('B');
			expect(document.body).toHaveTextContent('Stop 2 of 3');
			expect(screen.getByRole('link', { name: /b\.example/ })).toHaveAttribute(
				'href',
				'https://www.b.example/x'
			);
			expect(document.body).toHaveTextContent('Body');
			expect(screen.getByRole('link', { name: /Previous stop/ })).toHaveAttribute(
				'href',
				'/project/a'
			);
			expect(screen.getByRole('link', { name: /Next stop/ })).toHaveAttribute('href', '/project/c');
		});

		test('the end of the line, an unknown place, and a link that is not a URL', () => {
			render(Project, {
				data: {
					...base,
					index: -1,
					prev: null,
					next: null,
					project: { ...base.project, image: null, url: 'not a url' }
				}
			});
			expect(document.body).not.toHaveTextContent('Stop 2 of 3');
			expect(screen.getByRole('link', { name: /View project/ })).toBeInTheDocument();
			expect(screen.getByRole('link', { name: /End of the line/ })).toHaveAttribute(
				'href',
				'/projects'
			);
			expect(screen.queryByRole('link', { name: /Previous stop/ })).toBeNull();
			render(Project, { data: { ...base, project: { ...base.project, url: null } } });
		});

		test('← and → ride the line, but not while typing or with a modifier', async () => {
			render(Project, { data: base });
			await fireEvent.keyDown(window, { key: 'ArrowLeft' });
			expect(goto).toHaveBeenLastCalledWith('/project/a');
			await fireEvent.keyDown(window, { key: 'ArrowRight' });
			expect(goto).toHaveBeenLastCalledWith('/project/c');
			goto.mockClear();
			await fireEvent.keyDown(window, { key: 'ArrowRight', shiftKey: true });
			await fireEvent.keyDown(window, { key: 'ArrowRight', altKey: true });
			await fireEvent.keyDown(window, { key: 'ArrowRight', ctrlKey: true });
			await fireEvent.keyDown(window, { key: 'ArrowRight', metaKey: true });
			await fireEvent.keyDown(window, { key: 'Enter' });
			const input = document.createElement('input');
			document.body.append(input);
			await fireEvent.keyDown(input, { key: 'ArrowRight' });
			const prevented = new KeyboardEvent('keydown', { key: 'ArrowRight', cancelable: true });
			prevented.preventDefault();
			window.dispatchEvent(prevented);
			expect(goto).not.toHaveBeenCalled();
		});

		test('at the ends of the line the arrows do nothing', async () => {
			render(Project, { data: { ...base, prev: null, next: null } });
			await fireEvent.keyDown(window, { key: 'ArrowLeft' });
			await fireEvent.keyDown(window, { key: 'ArrowRight' });
			expect(goto).not.toHaveBeenCalled();
		});
	});
});

describe('a CMS page', () => {
	const data = (/** @type {any} */ over = {}) => ({
		page: {
			slug: 'now',
			title: 'Now',
			subtitle: '<p>Doing things</p>',
			date_updated: '2025-11-01T00:00:00',
			content_html:
				'<h2>Work</h2><p>a</p><h2 id="own">Play</h2><ul>' +
				'<li>x</li>'.repeat(14) +
				'</ul><h2>Read</h2><h2>Rest</h2><h2> </h2>',
			...over
		},
		next: null
	});

	test('a route strip of its headings, folded lists and a scroll-spy', async () => {
		render(CmsPage, { data: data() });
		await tick();
		expect(document.body).toHaveTextContent('Doing things');
		expect(document.body).toHaveTextContent('Updated November 01, 2025');
		const strip = screen.getByRole('navigation', { name: 'Stops on this page' });
		const links = within(strip).getAllByRole('link');
		expect(links.map((a) => a.getAttribute('href'))).toEqual([
			'#stop-1',
			'#own',
			'#stop-3',
			'#stop-4'
		]);
		expect(links[0]).toHaveAttribute('aria-current', 'location');
		expect(screen.getByRole('button', { name: 'Show 6 more' })).toBeInTheDocument();

		browser.intersect(/** @type {Element} */ (document.getElementById('own')));
		await tick();
		expect(links[1]).toHaveAttribute('aria-current', 'location');
		browser.intersect(/** @type {Element} */ (document.getElementById('stop-3')), {
			isIntersecting: false
		});
		await tick();
		expect(links[1]).toHaveAttribute('aria-current', 'location');
	});

	test('the trunk ends at the last heading, else the title’s ring', async () => {
		const real = window.getComputedStyle;
		vi.spyOn(window, 'getComputedStyle').mockImplementation((el, pseudo) =>
			pseudo ? /** @type {any} */ ({ top: '10px' }) : real(el)
		);
		const { container } = render(CmsPage, { data: data() });
		await tick();
		const line = /** @type {HTMLElement} */ (container.querySelector('.line-page'));
		expect(line.style.getPropertyValue('--trunk-end')).toMatch(/px$/);
		browser.resize();

		const plain = render(CmsPage, {
			data: data({ content_html: '<p>No headings</p>', subtitle: null })
		});
		await tick();
		const plainLine = /** @type {HTMLElement} */ (plain.container.querySelector('.line-page'));
		expect(plainLine.style.getPropertyValue('--trunk-end')).toBe('0px');
		expect(screen.queryAllByRole('navigation', { name: 'Stops on this page' })).toHaveLength(1);
	});

	test('a page without content', async () => {
		const { container } = render(CmsPage, { data: data({ content_html: null }) });
		await tick();
		expect(container.querySelector('.ride')).toBeEmptyDOMElement();
	});

	test('returning visitors are told when it has changed', async () => {
		localStorage.setItem('seen:now', '2025-10-01T00:00:00');
		const { unmount } = render(CmsPage, { data: data() });
		await tick();
		expect(screen.getByText('New since your last visit')).toBeInTheDocument();
		expect(localStorage.getItem('seen:now')).toBe('2025-11-01T00:00:00');
		unmount();
		render(CmsPage, { data: data() });
		await tick();
		expect(screen.queryByText('New since your last visit')).toBeNull();
	});

	test('first visits and blocked storage get no note', async () => {
		vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
			throw new Error('denied');
		});
		render(CmsPage, { data: data() });
		await tick();
		expect(screen.queryByText('New since your last visit')).toBeNull();
	});
});

describe('blog archives', () => {
	const card = (/** @type {number} */ i, over = {}) => ({
		slug: `p${i}`,
		title: `Post ${i}`,
		date_published: `${2025 - Math.floor(i / 3)}-01-0${(i % 3) + 1}`,
		category: i % 2 ? { name: 'Tech' } : null,
		minutes: 2,
		excerpt: i % 2 ? `Excerpt ${i}` : '',
		featured_image: i % 2 ? null : `img${i}`,
		redirect_url: null,
		...over
	});
	const categories = [
		{ name: 'Technology', slug: 'technology' },
		{ name: 'Travel', slug: 'travel' }
	];
	const tags = [{ name: 'Rail', slug: 'rail' }];
	const blogData = (/** @type {any} */ over = {}) => ({
		posts: [card(0), card(1), card(2), card(3, { date_published: null })],
		hasOlder: false,
		page: 1,
		categories,
		tags,
		q: '',
		...over
	});

	test('the blog: the latest post leads, the rest by year, then the tags', () => {
		page.url = new URL('https://alexwang.net/blog');
		render(Blog, { data: blogData() });
		expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Blog');
		expect(document.body).toHaveTextContent('Technology, servers, transportation and travel.');
		const latest = screen.getByRole('region', { name: 'Latest' });
		expect(within(latest).getByRole('link')).toHaveAttribute('href', '/blog/p0');
		expect(latest.querySelector('img')).toHaveAttribute('src', expect.stringContaining('img0'));
		expect(screen.getByRole('region', { name: '2025' })).toBeInTheDocument();
		expect(screen.getByRole('region', { name: 'Undated' })).toBeInTheDocument();
		expect(screen.getByRole('region', { name: 'Browse by tag' })).toHaveClass('station-end');
		expect(screen.getByRole('link', { name: 'All posts' })).toHaveAttribute('aria-current', 'page');
		expect(screen.queryByRole('navigation', { name: 'Breadcrumb' })).toBeNull();
		expect(screen.queryByRole('link', { name: /Older posts/ })).toBeNull();
		expect(document.head.querySelector('link[rel=next]')).toBeNull();
	});

	test('a lead that lives elsewhere, without a picture or summary', () => {
		render(Blog, {
			data: blogData({ posts: [card(1, { redirect_url: 'https://x.example' })], tags: [] })
		});
		const lead = within(screen.getByRole('region', { name: 'Latest' })).getByRole('link');
		expect(lead).toHaveAttribute('href', 'https://x.example');
		expect(lead).toHaveAttribute('target', '_blank');
		expect(screen.queryByRole('region', { name: 'Browse by tag' })).toBeNull();
	});

	test('an empty blog', () => {
		render(Blog, { data: blogData({ posts: [], tags: [] }) });
		expect(document.body).toHaveTextContent('No posts here yet.');
	});

	test('search results, and a search that finds nothing', () => {
		page.url = new URL('https://alexwang.net/blog?q=rail');
		const { unmount } = render(Blog, { data: blogData({ q: 'rail' }) });
		expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Search: rail');
		expect(screen.queryByRole('region', { name: 'Latest' })).toBeNull();
		const results = screen.getByRole('region', { name: 'Results for “rail”' });
		expect(within(results).getAllByRole('link')).toHaveLength(4);
		expect(
			within(screen.getByRole('navigation', { name: 'Breadcrumb' })).getByText('Search')
		).toHaveAttribute('aria-current', 'page');
		expect(screen.getByRole('searchbox')).toHaveValue('rail');
		expect(screen.getByRole('link', { name: 'All posts' })).not.toHaveAttribute('aria-current');
		unmount();

		render(Blog, { data: blogData({ q: 'zzz', posts: [] }) });
		expect(screen.getByRole('region', { name: 'Results for “zzz”' })).toHaveTextContent(
			'Nothing matches that search.'
		);
		expect(document.body).not.toHaveTextContent('No posts here yet.');
	});

	test('a later page links back to newer posts', () => {
		page.url = new URL('https://alexwang.net/blog?page=3');
		render(Blog, { data: blogData({ page: 3, hasOlder: true }) });
		expect(screen.getByRole('link', { name: /Newer posts/ })).toHaveAttribute(
			'href',
			'/blog?page=2'
		);
		expect(document.head.querySelector('link[rel=prev]')).toHaveAttribute('href', '/blog?page=2');
		expect(document.head.querySelector('link[rel=next]')).toHaveAttribute('href', '/blog?page=4');
		expect(screen.queryByRole('region', { name: 'Latest' })).toBeNull();
	});

	test('page two links back to the first page itself', () => {
		page.url = new URL('https://alexwang.net/blog?page=2');
		render(Blog, { data: blogData({ page: 2 }) });
		expect(screen.getByRole('link', { name: /Newer posts/ })).toHaveAttribute('href', '/blog');
	});

	test('older posts load as the reader nears the end, once each', async () => {
		page.url = new URL('https://alexwang.net/blog/category/technology');
		const fetch = vi.fn(async () =>
			Response.json({ posts: [card(3), card(4)], hasOlder: true, page: 2 })
		);
		vi.stubGlobal('fetch', fetch);
		const { container } = render(Category, {
			data: {
				...blogData({ hasOlder: true, tags: [] }),
				category: { name: 'Technology', slug: 'technology', description: '' }
			}
		});
		expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Technology');
		expect(document.body).toHaveTextContent('Posts filed under Technology');
		expect(screen.getByRole('link', { name: 'Technology' })).toHaveAttribute(
			'aria-current',
			'page'
		);
		const older = screen.getByRole('link', { name: /Older posts/ });
		expect(older).toHaveAttribute('href', '/blog/category/technology?page=2');

		const sentinel = /** @type {Element} */ (older.parentElement);
		browser.intersect(sentinel);
		await vi.waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));
		expect(fetch).toHaveBeenCalledWith('/blog/posts.json?category=technology&page=2');
		await vi.waitFor(() =>
			expect(screen.getByRole('status')).toHaveTextContent('1 more post loaded')
		);
		expect(container.querySelectorAll('a[href="/blog/p3"]')).toHaveLength(1);
		expect(container.querySelector('a[href="/blog/p4"]')).not.toBeNull();

		// clicking the link loads the next page in place
		fetch.mockResolvedValueOnce(
			Response.json({ posts: [card(5), card(6)], hasOlder: false, page: 3 })
		);
		await fireEvent.click(screen.getByRole('link', { name: /Older posts/ }));
		await vi.waitFor(() =>
			expect(screen.getByRole('status')).toHaveTextContent('2 more posts loaded')
		);
		expect(fetch).toHaveBeenLastCalledWith('/blog/posts.json?category=technology&page=3');
		expect(screen.queryByRole('link', { name: /Older posts/ })).toBeNull();
	});

	test('a failed load offers to try again; a load in flight is not repeated', async () => {
		page.url = new URL('https://alexwang.net/blog/tag/rail?q=x');
		/** @type {(r: Response) => void} */
		let release = () => {};
		const fetch = vi.fn(() => new Promise((r) => (release = r)));
		vi.stubGlobal('fetch', fetch);
		render(Tag, {
			data: {
				...blogData({ hasOlder: true, tags: [] }),
				tag: { name: 'Rail', slug: 'rail', description: 'Trains.' }
			}
		});
		expect(document.body).toHaveTextContent('Trains.');
		const older = screen.getByRole('link', { name: /Older posts/ });
		await fireEvent.click(older);
		await fireEvent.click(older);
		expect(fetch).toHaveBeenCalledTimes(1);
		expect(older).toHaveAttribute('aria-busy', 'true');
		release(new Response('', { status: 500 }));
		const retry = await screen.findByRole('button', { name: /Couldn’t load more/ });

		fetch.mockImplementationOnce(async () => Promise.reject(new Error('offline')));
		await fireEvent.click(retry);
		await screen.findByRole('button', { name: /Couldn’t load more/ });

		fetch.mockImplementationOnce(async () => Response.json({ posts: [], hasOlder: false }));
		await fireEvent.click(screen.getByRole('button', { name: /Couldn’t load more/ }));
		await vi.waitFor(() =>
			expect(screen.getByRole('status')).toHaveTextContent('0 more posts loaded')
		);
	});

	test('a tag page without a description, and a query carried into the scroll', async () => {
		const fetch = vi.fn(async () => Response.json({ posts: [], hasOlder: false }));
		vi.stubGlobal('fetch', fetch);
		render(Tag, {
			data: {
				...blogData({ hasOlder: true }),
				tag: { name: 'Rail', slug: 'rail', description: null }
			}
		});
		expect(document.body).toHaveTextContent('Posts tagged “Rail”');
		render(Blog, { data: blogData({ q: 'train', hasOlder: true }) });
		await fireEvent.click(screen.getAllByRole('link', { name: /Older posts/ })[1]);
		expect(fetch).toHaveBeenLastCalledWith('/blog/posts.json?q=train&page=2');
	});

	test('an archive with only a heading', () => {
		render(BlogArchive, { data: blogData({ tags: undefined }), heading: 'Plain' });
		expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Plain');
		expect(screen.queryByRole('navigation', { name: 'Breadcrumb' })).toBeNull();
		expect(screen.queryByRole('region', { name: 'Browse by tag' })).toBeNull();
	});

	test('a category with its own description', () => {
		render(Category, {
			data: { ...blogData(), category: { name: 'Travel', slug: 'travel', description: 'Trips.' } }
		});
		expect(document.body).toHaveTextContent('Trips.');
	});
});
