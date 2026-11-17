import { describe, expect, test, vi } from 'vitest';
import { browser } from '../../setup/dom.js';

const motion = vi.hoisted(() => ({
	/** @type {any[]} */
	views: [],
	animate: vi.fn(() => ({ finished: Promise.resolve() })),
	inView: vi.fn()
}));
vi.mock('motion', () => ({
	animate: motion.animate,
	inView: motion.inView.mockImplementation((el, cb, opts) => {
		const stop = vi.fn();
		motion.views.push({ el, cb, opts, stop });
		return stop;
	})
}));

import { foldLists } from '#lib/enhance.js';
import { watchReveals, stagger } from '#lib/reveal.js';

const tick = () => new Promise((r) => setTimeout(r, 0));

describe('foldLists', () => {
	const make = (/** @type {number} */ n, tag = 'ul') => {
		const root = document.createElement('div');
		root.innerHTML = `<${tag}>${'<li>x</li>'.repeat(n)}</${tag}>`;
		return root;
	};

	test('short lists are left alone', () => {
		const root = make(12);
		foldLists(root);
		expect(root.querySelector('button')).toBeNull();
		expect(root.querySelectorAll('li[hidden]')).toHaveLength(0);
	});

	test('a long list keeps the first eight and folds the rest behind a toggle', () => {
		const root = make(13, 'ol');
		foldLists(root);
		const button = /** @type {HTMLButtonElement} */ (root.querySelector('ol + button'));
		expect(button.textContent).toBe('Show 5 more');
		expect(button.type).toBe('button');
		expect(button).toHaveAttribute('aria-expanded', 'false');
		expect(root.querySelectorAll('li[hidden]')).toHaveLength(5);

		button.click();
		expect(button.textContent).toBe('Show fewer');
		expect(button).toHaveAttribute('aria-expanded', 'true');
		expect(root.querySelectorAll('li[hidden]')).toHaveLength(0);

		button.click();
		expect(button.textContent).toBe('Show 5 more');
		expect(root.querySelectorAll('li[hidden]')).toHaveLength(5);
	});

	test('limits can be set, and only direct list items count', () => {
		const root = document.createElement('div');
		root.innerHTML =
			'<ul><li>a</li><li>b</li><li>c<ul><li>n</li></ul></li><template></template></ul>';
		foldLists(root, { keep: 1, over: 2 });
		expect(root.querySelectorAll('button')).toHaveLength(1);
		expect(root.querySelector('button')?.textContent).toBe('Show 2 more');
	});
});

describe('reveals', () => {
	test('elements rise in as they come into view, then hand back to the stylesheet', async () => {
		motion.views.length = 0;
		// jsdom does not compute custom properties
		vi.spyOn(window, 'getComputedStyle').mockReturnValue(
			/** @type {any} */ ({ getPropertyValue: () => '200ms' })
		);
		const root = document.createElement('div');
		root.innerHTML = '<p class="reveal" style="--d: 200ms">a</p><p class="reveal in">done</p>';
		const stop = watchReveals(root);
		expect(motion.views).toHaveLength(1);
		const [view] = motion.views;
		expect(view.opts).toEqual({ margin: '0px 0px -8% 0px' });

		view.cb();
		expect(motion.animate).toHaveBeenCalledWith(
			view.el,
			{ opacity: [0, 1], transform: ['translateY(26px)', 'translateY(0px)'] },
			{ duration: 0.7, delay: 0.2, ease: [0.2, 0.7, 0.2, 1] }
		);
		view.el.style.opacity = '1';
		view.el.style.transform = 'none';
		await tick();
		browser.frame();
		expect(view.el.style.opacity).toBe('');
		expect(view.el.style.transform).toBe('');
		expect(view.el).toHaveClass('in');

		// added later: picked up once, not twice
		const late = document.createElement('p');
		late.className = 'reveal';
		root.append(late);
		await tick();
		expect(motion.views).toHaveLength(2);
		expect(motion.views[1].el).toBe(late);
		root.append(document.createElement('span'));
		await tick();
		expect(motion.views).toHaveLength(2);

		stop();
		expect(view.stop).toHaveBeenCalled();
		root.append(Object.assign(document.createElement('p'), { className: 'reveal' }));
		await tick();
		expect(motion.views).toHaveLength(2);
	});

	test('without a delay the rise starts at once', () => {
		motion.views.length = 0;
		const root = document.createElement('div');
		root.innerHTML = '<p class="reveal">a</p>';
		const stop = watchReveals(root);
		motion.views[0].cb();
		expect(motion.animate.mock.lastCall?.[2]).toMatchObject({ delay: 0 });
		stop();
	});

	test('under reduced motion everything is simply shown', () => {
		browser.media.reduce = true;
		motion.views.length = 0;
		const root = document.createElement('div');
		root.innerHTML = '<p class="reveal">a</p>';
		watchReveals(root)();
		expect(motion.views).toHaveLength(0);
		expect(root.firstElementChild).toHaveClass('in');
	});

	test('stagger marks a block’s children, skipping exceptions, and rescans', async () => {
		motion.views.length = 0;
		const main = document.createElement('main');
		const block = document.createElement('div');
		block.innerHTML = '<h2>h</h2>' + '<p>p</p>'.repeat(7);
		block.append(document.createElementNS('http://www.w3.org/2000/svg', 'svg'));
		main.append(block);
		const stop = watchReveals(main);
		stagger(block, 'h2');
		const kids = /** @type {HTMLElement[]} */ ([...block.children]);
		expect(kids[0]).not.toHaveClass('reveal');
		expect(kids[1]).toHaveClass('reveal');
		expect(kids[1].style.getPropertyValue('--d')).toBe('50ms');
		expect(kids[7].style.getPropertyValue('--d')).toBe('250ms');
		expect(kids[8].classList.contains('reveal')).toBe(false);
		// the rescan found them straight away, without waiting for a mutation
		expect(motion.views).toHaveLength(7);
		stop();

		// with nothing watching, stagger still marks; and every child counts without an exception
		const other = document.createElement('div');
		other.innerHTML = '<p>a</p><h2>b</h2>';
		stagger(other);
		expect(other.querySelectorAll('.reveal')).toHaveLength(2);
	});

	test('stopping an older watcher leaves the newer one in charge of rescans', () => {
		motion.views.length = 0;
		const a = document.createElement('div');
		const b = document.createElement('div');
		const stopA = watchReveals(a);
		const stopB = watchReveals(b);
		stopA();
		const p = document.createElement('p');
		b.append(p);
		stagger(b);
		expect(motion.views.map((v) => v.el)).toEqual([p]);
		stopB();
	});
});

describe('darkmode store', () => {
	const load = async (/** @type {boolean} */ isBrowser) => {
		vi.resetModules();
		vi.doMock('$app/env', () => ({
			browser: isBrowser,
			dev: false,
			building: false,
			version: 't'
		}));
		const { darkmode } = await import('../../../src/stores.js');
		const { get } = await import('svelte/store');
		return { darkmode, get };
	};

	test('on the server it is simply dark', async () => {
		const { darkmode, get } = await load(false);
		expect(get(darkmode)).toBe(true);
		expect(document.documentElement.dataset.theme).toBeUndefined();
	});

	test('defaults to dark, applies the theme and saves the choice', async () => {
		const { darkmode, get } = await load(true);
		expect(get(darkmode)).toBe(true);
		expect(document.documentElement).toHaveClass('dark');
		expect(document.documentElement.dataset.theme).toBe('line-night');
		darkmode.set(false);
		expect(document.documentElement).not.toHaveClass('dark');
		expect(document.documentElement.dataset.theme).toBe('line');
		expect(localStorage.getItem('darkmode')).toBe('false');
	});

	test('a saved light choice is restored', async () => {
		localStorage.setItem('darkmode', 'false');
		const { darkmode, get } = await load(true);
		expect(get(darkmode)).toBe(false);
	});

	test('works without storage', async () => {
		const getItem = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
			throw new Error('denied');
		});
		const setItem = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
			throw new Error('denied');
		});
		const { darkmode, get } = await load(true);
		expect(get(darkmode)).toBe(true);
		darkmode.set(false);
		expect(document.documentElement.dataset.theme).toBe('line');
		expect(getItem).toHaveBeenCalled();
		expect(setItem).toHaveBeenCalled();
	});
});
