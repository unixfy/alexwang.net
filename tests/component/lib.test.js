import { describe, expect, test, vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/svelte';
import { tick } from 'svelte';
import { browser } from '../setup/dom.js';
import { html } from '../helpers/snippet.js';
import { page } from '../helpers/app.svelte.js';

const net = vi.hoisted(() => ({ stop: vi.fn(), start: vi.fn() }));
vi.mock('#lib/network.js', () => ({ startNetwork: net.start }));

const tw = vi.hoisted(() => ({
	/** @type {any} */
	instance: { hot: vi.fn(), destroy: vi.fn() },
	start: vi.fn()
}));
vi.mock('../../src/lib/tower.js', () => ({ startTower: tw.start }));

import CopyButton from '#lib/CopyButton.svelte';
import Footer from '#lib/Footer.svelte';
import Station from '#lib/Station.svelte';
import Stop from '#lib/Stop.svelte';
import BlogCards from '#lib/BlogCards.svelte';
import BlogLister from '#lib/BlogLister.svelte';
import RideRoute from '#lib/RideRoute.svelte';
import RideBar from '#lib/RideBar.svelte';
import Network from '#lib/Network.svelte';
import Tower from '#lib/Tower.svelte';
import Navbar from '#lib/Navbar.svelte';

const posts = [
	{
		slug: 'a',
		title: 'Post A',
		date_published: '2025-03-04',
		category: { name: 'Tech' },
		minutes: 3,
		excerpt: 'About A',
		featured_image: 'img-a',
		redirect_url: null
	},
	{
		slug: 'b',
		title: 'Post B',
		date_published: '2025-02-01',
		category: null,
		minutes: 1,
		excerpt: '',
		featured_image: null,
		redirect_url: 'https://elsewhere.example/b'
	}
];

describe('CopyButton', () => {
	test('copies the text, confirms, and resets after a moment', async () => {
		vi.useFakeTimers();
		const writeText = vi.fn(async () => {});
		Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } });
		render(CopyButton, { text: 'ssh-key', what: 'SSH key', class: 'extra' });
		const button = screen.getByRole('button', { name: /^Copy\s*SSH key$/ });
		expect(button).toHaveClass('extra');
		await fireEvent.click(button);
		expect(writeText).toHaveBeenCalledWith('ssh-key');
		expect(button).toHaveTextContent('Copied');
		expect(button).toHaveClass('btn-success');
		expect(screen.getByRole('status')).toHaveTextContent('SSH key copied');
		await vi.advanceTimersByTimeAsync(1800);
		expect(button).toHaveTextContent('Copy');
		expect(screen.getByRole('status')).toHaveTextContent('');
		vi.useRealTimers();
	});

	test('a refused clipboard changes nothing', async () => {
		Object.defineProperty(navigator, 'clipboard', {
			configurable: true,
			value: { writeText: vi.fn(async () => Promise.reject(new Error('denied'))) }
		});
		render(CopyButton, { text: 'x', label: 'Grab' });
		const button = screen.getByRole('button', { name: /^Grab\s*text$/ });
		await fireEvent.click(button);
		expect(button).toHaveTextContent('Grab');
	});
});

describe('small pieces', () => {
	test('the footer carries the current year', () => {
		render(Footer);
		expect(
			screen.getByText(`Copyright © 2020-${new Date().getFullYear()} Alex Wang`)
		).toBeInTheDocument();
	});

	test('a station is a labelled section on its line', () => {
		const { container } = render(Station, { id: 'work', title: 'Work', children: html('inside') });
		const section = screen.getByRole('region', { name: 'Work' });
		expect(section).toHaveAttribute('style', expect.stringContaining('--line: var(--line-work)'));
		expect(section).not.toHaveClass('station-end');
		expect(container).toHaveTextContent('inside');
		render(Station, { id: 'end', title: 'End', line: 'contact', end: true, children: html('x') });
		expect(screen.getByRole('region', { name: 'End' })).toHaveClass('station-end');
	});

	test('a stop: back, on, and the end of the line', () => {
		render(Stop, { kind: 'prev', href: '/p', title: 'Back', meta: 'Jan', image: 'img' });
		const back = screen.getByRole('link', { name: /Previous stop/ });
		expect(back).toHaveAttribute('rel', 'prev');
		expect(back.querySelector('img')).toHaveAttribute(
			'src',
			'https://cms.alexwang.net/assets/img?format=webp&width=480'
		);
		expect(back).toHaveTextContent('· Jan');
		expect(back.querySelector('.fa-arrow-left')).not.toBeNull();

		render(Stop, { kind: 'next', href: '/n', title: 'On' });
		const on = screen.getByRole('link', { name: /Next stop/ });
		expect(on).toHaveAttribute('rel', 'next');
		expect(on.querySelector('img')).toBeNull();
		expect(on.querySelector('.fa-arrow-right')).not.toBeNull();

		render(Stop, { kind: 'end', href: '/all', title: 'All' });
		const end = screen.getByRole('link', { name: /End of the line/ });
		expect(end).not.toHaveAttribute('rel');
		expect(end.querySelector('.fa-flag-checkered')).not.toBeNull();
	});
});

describe('post lists', () => {
	test('cards: own posts link here, stubs link away; short dates on request', () => {
		render(BlogCards, { posts });
		const a = screen.getByRole('link', { name: /Post A/ });
		expect(a).toHaveAttribute('href', '/blog/a');
		expect(a).not.toHaveAttribute('target');
		expect(a).toHaveTextContent('March 04, 2025');
		expect(a).toHaveTextContent('Tech');
		expect(a).toHaveTextContent('3 min ride');
		expect(a).toHaveTextContent('About A');
		expect(a.querySelector('img')).toHaveAttribute(
			'src',
			'https://cms.alexwang.net/assets/img-a?format=webp&width=900'
		);
		const b = screen.getByRole('link', { name: /Post B/ });
		expect(b).toHaveAttribute('href', 'https://elsewhere.example/b');
		expect(b).toHaveAttribute('target', '_blank');
		expect(b).toHaveAttribute('rel', 'noopener');
		expect(b.querySelector('img')).toBeNull();
		expect(b.querySelector('.fa-arrow-up-right-from-square')).not.toBeNull();

		render(BlogCards, { posts: [posts[0]], short: true });
		expect(screen.getAllByRole('link', { name: /Post A/ })[1]).toHaveTextContent('Mar 4');
	});

	test('the home page list', () => {
		render(BlogLister, { posts });
		const a = screen.getByRole('link', { name: /Post A/ });
		expect(a).toHaveTextContent('March 04, 2025 · Tech · 3 min ride');
		expect(a.querySelector('img')).toHaveAttribute('src', expect.stringContaining('width=400'));
		const b = screen.getByRole('link', { name: /Post B/ });
		expect(b).toHaveTextContent('February 01, 2025 · 1 min ride');
		expect(b).toHaveAttribute('target', '_blank');
		expect(b.querySelector('img')).toBeNull();
	});
});

describe('the ride', () => {
	const stops = [
		{ id: 'one', text: 'One' },
		{ id: 'two', text: 'Two' },
		{ id: 'three', text: 'Three' }
	];

	test('the route marks passed, current and coming stops', async () => {
		const pick = vi.fn();
		const { container, rerender } = render(RideRoute, { stops, at: 2, pick });
		const states = [...container.querySelectorAll('li')].map((li) => li.dataset.state);
		expect(states).toEqual(['passed', 'current', 'next']);
		expect(container.querySelector('ol')).toHaveAttribute('data-started');
		expect(screen.getByRole('link', { name: 'Two' })).toHaveAttribute('aria-current', 'location');
		await fireEvent.click(screen.getByRole('link', { name: 'Three' }));
		expect(pick).toHaveBeenCalled();
		await rerender({ stops, at: 0 });
		expect(container.querySelector('ol')).not.toHaveAttribute('data-started');
	});

	test('the bar: label, time left, and a menu that closes', async () => {
		const { container, rerender } = render(RideBar, { stops, at: 0, minutesLeft: 9, shown: true });
		const bar = /** @type {HTMLElement} */ (container.querySelector('.bar'));
		expect(bar).toHaveClass('shown');
		expect(bar).toHaveTextContent('3 stops ahead');
		expect(bar).toHaveTextContent('9 min left');
		const menu = /** @type {HTMLDetailsElement} */ (container.querySelector('details'));

		await rerender({ stops, at: 2, minutesLeft: 4, shown: true });
		expect(bar).toHaveTextContent('Stop 2 of 3 · Two');
		menu.open = true;
		await fireEvent.click(within(menu).getByRole('link', { name: 'Three' }));
		expect(menu.open).toBe(false);

		menu.open = true;
		await fireEvent.keyDown(window, { key: 'Escape' });
		expect(menu.open).toBe(false);
		expect(document.activeElement).toBe(menu.querySelector('summary'));
		await fireEvent.keyDown(window, { key: 'Escape' }); // already closed
		await fireEvent.keyDown(window, { key: 'a' });

		await rerender({ stops, at: 4, minutesLeft: 0, shown: true });
		expect(bar).toHaveTextContent('Arrived');
		expect(bar).not.toHaveTextContent('min left');

		menu.open = true;
		await rerender({ stops, at: 4, minutesLeft: 0, shown: false });
		expect(menu.open).toBe(false);
		expect(bar).not.toHaveClass('shown');
		expect(bar.inert).toBe(true);

		render(RideBar, { stops: [stops[0]], at: 0, minutesLeft: 1, shown: false });
		expect(screen.getByText('1 stop ahead')).toBeInTheDocument();
	});
});

describe('Network', () => {
	test('starts the map with its options and stops it on unmount', () => {
		net.start.mockReturnValue(net.stop);
		const { unmount, container } = render(Network, {
			focus: 1,
			starts: [[0.5, 0.5]],
			narrowAlpha: 0.4,
			children: html('<p>hero</p>')
		});
		const [host, canvas, options] = net.start.mock.calls[0];
		expect(host).toContainElement(canvas);
		expect(options).toEqual({ focus: 1, starts: [[0.5, 0.5]], narrowAlpha: 0.4 });
		expect(container.querySelector('canvas')?.getAttribute('class')).toContain(
			'md:[mask-image:linear-gradient(to_bottom,transparent_2rem,black_7rem)]'
		);
		expect(container).toHaveTextContent('hero');
		unmount();
		expect(net.stop).toHaveBeenCalled();
	});

	test('without WebGL there is nothing to stop; the bottom fade can be chosen', () => {
		net.start.mockReturnValue(null);
		const { unmount, container } = render(Network, { fade: 'bottom', children: html('x') });
		expect(container.querySelector('canvas')?.getAttribute('class')).toContain('black_72%');
		unmount();
	});
});

describe('Tower', () => {
	const stops = [
		{ id: 'a', label: 'About', line: /** @type {const} */ ('work') },
		{ id: 'b', label: 'Bits', line: /** @type {const} */ ('writing'), sub: true }
	];

	test('the links work alone; the 3D tower joins on wide screens', async () => {
		tw.start.mockImplementation((_h, _c, ids, lines, onActive, subs) => {
			expect([ids, lines, subs]).toEqual([
				['a', 'b'],
				['work', 'writing'],
				[false, true]
			]);
			tw.instance.onActive = onActive;
			return tw.instance;
		});
		const { container, unmount } = render(Tower, { stops });
		const about = screen.getByRole('link', { name: 'About' });
		expect(about).toHaveAttribute('href', '#a');
		expect(about).toHaveAttribute('aria-current', 'location');
		expect(screen.getByRole('link', { name: 'Bits' })).toHaveClass('stop-sub');
		await vi.waitFor(() => expect(container.querySelector('.tower')).toHaveClass('ready'));

		tw.instance.onActive(1);
		await tick();
		expect(screen.getByRole('link', { name: 'Bits' })).toHaveAttribute('aria-current', 'location');

		await fireEvent.pointerEnter(about);
		expect(tw.instance.hot).toHaveBeenLastCalledWith(0);
		await fireEvent.pointerLeave(about);
		expect(tw.instance.hot).toHaveBeenLastCalledWith(-1);
		await fireEvent.focus(about);
		expect(tw.instance.hot).toHaveBeenLastCalledWith(0);
		await fireEvent.blur(about);
		expect(tw.instance.hot).toHaveBeenLastCalledWith(-1);
		unmount();
		expect(tw.instance.destroy).toHaveBeenCalled();
	});

	test('narrow screens get only the links', async () => {
		browser.media.wide = false;
		tw.start.mockClear();
		const { unmount } = render(Tower, { stops });
		await new Promise((r) => setTimeout(r, 10));
		expect(tw.start).not.toHaveBeenCalled();
		await fireEvent.pointerEnter(screen.getByRole('link', { name: 'About' }));
		unmount();
	});

	test('without WebGL the plain rail stays; unmounting before it loads starts nothing', async () => {
		tw.start.mockReset().mockReturnValue(null);
		const { container, unmount } = render(Tower, { stops });
		await vi.waitFor(() => expect(tw.start).toHaveBeenCalled());
		expect(container.querySelector('.tower')).not.toHaveClass('ready');
		unmount();

		tw.start.mockClear();
		render(Tower, { stops }).unmount();
		await new Promise((r) => setTimeout(r, 10));
		expect(tw.start).not.toHaveBeenCalled();
	});
});

describe('Navbar', () => {
	test('off the home page: a Home link, the lockup, and the current section marked', async () => {
		page.url = new URL('https://alexwang.net/blog/some-post');
		render(Navbar);
		const homes = screen.getAllByRole('link', { name: 'Home' });
		expect(homes).toHaveLength(2);
		expect(screen.getAllByRole('link', { name: 'Alex Wang, home' })).toHaveLength(2);
		for (const blog of screen.getAllByRole('link', { name: 'Blog' }))
			expect(blog).toHaveAttribute('aria-current', 'page');
		expect(homes[0]).not.toHaveAttribute('aria-current');
		expect(screen.getAllByRole('link', { name: /LinkedIn/ })[0]).toHaveTextContent(
			'(opens LinkedIn)'
		);
	});

	test('on the home page there is no Home link or lockup', () => {
		render(Navbar);
		expect(screen.queryByRole('link', { name: 'Home' })).toBeNull();
		expect(screen.queryByRole('link', { name: 'Alex Wang, home' })).toBeNull();
	});

	test('the phone menu opens, and closes on a link, Escape, or a tap outside', async () => {
		render(Navbar);
		const toggle = screen.getByRole('button', { name: 'Menu' });
		const menu = /** @type {HTMLElement} */ (document.getElementById('mobile-menu'));
		expect(menu).toHaveClass('hidden');
		await fireEvent.click(toggle);
		expect(toggle).toHaveAttribute('aria-expanded', 'true');
		expect(menu).not.toHaveClass('hidden');
		await fireEvent.click(within(menu).getByRole('link', { name: 'Blog' }));
		expect(menu).toHaveClass('hidden');

		await fireEvent.click(toggle);
		await fireEvent.keyDown(window, { key: 'x' });
		expect(menu).not.toHaveClass('hidden');
		await fireEvent.keyDown(window, { key: 'Escape' });
		expect(menu).toHaveClass('hidden');

		await fireEvent.click(toggle);
		await fireEvent.pointerDown(menu); // inside: stays open
		expect(menu).not.toHaveClass('hidden');
		await fireEvent.pointerDown(document.body);
		expect(menu).toHaveClass('hidden');
		await fireEvent.pointerDown(document.body); // closed already
	});

	test('the theme switch flips dark mode, with a view transition where there is one', async () => {
		render(Navbar);
		const [toggle] = screen.getAllByRole('button', { name: 'Dark mode' });
		const before = toggle.getAttribute('aria-pressed');
		await fireEvent.click(toggle);
		expect(toggle.getAttribute('aria-pressed')).not.toBe(before);

		const start = vi.fn(async (/** @type {() => Promise<void>} */ cb) => cb());
		Object.defineProperty(document, 'startViewTransition', { configurable: true, value: start });
		await fireEvent.click(toggle);
		expect(start).toHaveBeenCalled();
		await tick();
		expect(toggle.getAttribute('aria-pressed')).toBe(before);

		browser.media.reduce = true;
		await fireEvent.click(toggle);
		expect(start).toHaveBeenCalledTimes(1);
		// @ts-ignore
		delete document.startViewTransition;
	});
});
