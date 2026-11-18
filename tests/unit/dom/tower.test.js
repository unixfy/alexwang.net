import { describe, expect, test, vi } from 'vitest';
import { browser } from '../../setup/dom.js';

const fake = vi.hoisted(() => ({
	fail: false,
	/** @type {any[]} */
	renderers: [],
	scrollStop: vi.fn(),
	/** @type {(() => void) | null} */
	onScroll: null
}));

vi.mock('three', async (importOriginal) => {
	const three = /** @type {any} */ (await importOriginal());
	class WebGLRenderer {
		constructor() {
			if (fake.fail) throw new Error('no WebGL');
			fake.renderers.push(this);
		}
		setClearColor = vi.fn();
		setPixelRatio = vi.fn();
		setSize = vi.fn();
		render = vi.fn();
		dispose = vi.fn();
		forceContextLoss = vi.fn();
	}
	return { ...three, WebGLRenderer };
});
vi.mock('motion', () => ({
	scroll: vi.fn((/** @type {() => void} */ cb) => {
		fake.onScroll = cb;
		return fake.scrollStop;
	})
}));

import { startTower } from '#lib/tower.js';

const tick = () => new Promise((r) => setTimeout(r, 0));
const rect = (top = 0, height = 0, width = 300) =>
	/** @type {DOMRect} */ ({
		top,
		height,
		width,
		left: 0,
		right: width,
		bottom: top + height,
		x: 0,
		y: top,
		toJSON() {}
	});

/** A rail with a link per station, and the sections those links point to. */
function setup(n = 4) {
	const host = document.createElement('div');
	host.getBoundingClientRect = () => rect(0, 600);
	const ids = Array.from({ length: n }, (_, i) => `s${i}`);
	ids.forEach((id, i) => {
		const a = document.createElement('a');
		a.dataset.stop = '';
		a.getBoundingClientRect = () => rect(40 + i * 120, 44);
		host.append(a);
		const section = document.createElement('section');
		section.id = id;
		section.getBoundingClientRect = () => rect(i * 1000 - scrollY, 900);
		document.body.append(section);
	});
	const canvas = document.createElement('canvas');
	host.append(canvas);
	document.body.append(host);
	return { host, canvas, ids };
}

const lines = /** @type {const} */ (['work', 'writing', 'contact', 'work']);

/** jsdom ignores writes to scrollY */
const scrollTo = (/** @type {number} */ y) =>
	Object.defineProperty(window, 'scrollY', { configurable: true, value: y });

describe('startTower', () => {
	test('without WebGL there is no tower', () => {
		fake.fail = true;
		const { host, canvas, ids } = setup();
		expect(startTower(host, canvas, ids, [...lines], vi.fn())).toBeNull();
		fake.fail = false;
	});

	test('builds a station per section and draws on request', () => {
		document.body.innerHTML = '';
		const { host, canvas, ids } = setup();
		const onActive = vi.fn();
		const tower = startTower(host, canvas, ids, [...lines], onActive, [false, true]);
		const r = fake.renderers.at(-1);
		expect(r.setSize).toHaveBeenCalledWith(300, 600, false);
		expect(browser.pendingFrames()).toBe(1);
		browser.frame(1000);
		expect(r.render).toHaveBeenCalledTimes(1);
		// not running until it is on screen: no loop
		expect(browser.pendingFrames()).toBe(0);
		tower?.destroy();
		expect(r.dispose).toHaveBeenCalled();
		expect(r.forceContextLoss).toHaveBeenCalled();
	});

	test('the train follows the reader and the current station is reported', () => {
		document.body.innerHTML = '';
		const { host, canvas, ids } = setup();
		const onActive = vi.fn();
		const tower = startTower(host, canvas, ids, [...lines], onActive);
		browser.intersect(host, { intersectionRatio: 1 });
		browser.frame(0);
		browser.frame(16);
		expect(onActive).not.toHaveBeenCalled();

		// the reading line sits 45% down the window; section 2 starts at 2000px
		scrollTo(1700);
		for (let t = 32; t < 1000; t += 16) browser.frame(t);
		expect(onActive).toHaveBeenLastCalledWith(2);
		expect(fake.renderers.at(-1).render.mock.calls.length).toBeGreaterThan(50);

		// past the last section: the last station, the train at its end
		scrollTo(99999);
		browser.frame(2000);
		expect(onActive).toHaveBeenLastCalledWith(3);
		scrollTo(0);
		tower?.destroy();
	});

	test('hovering a stop leans the tower toward it', () => {
		document.body.innerHTML = '';
		const { host, canvas, ids } = setup();
		const tower = startTower(host, canvas, ids, [...lines], vi.fn());
		browser.frame(0);
		tower?.hot(1);
		// not running: a single redraw is requested
		expect(browser.pendingFrames()).toBe(1);
		browser.frame(16);
		tower?.hot(-1);
		browser.intersect(host, { intersectionRatio: 1 });
		tower?.hot(2); // running: the loop picks it up
		expect(browser.pendingFrames()).toBe(1);
		tower?.destroy();
	});

	test('a mostly hidden rail stops animating but still draws once', () => {
		document.body.innerHTML = '';
		const { host, canvas, ids } = setup();
		const tower = startTower(host, canvas, ids, [...lines], vi.fn());
		browser.intersect(host, { intersectionRatio: 1 });
		browser.intersect(host, { intersectionRatio: 1 }); // already running
		browser.frame(0);
		browser.intersect(host, { intersectionRatio: 0.1 });
		expect(browser.pendingFrames()).toBe(1);
		browser.frame(16);
		expect(browser.pendingFrames()).toBe(0);
		tower?.destroy();
	});

	test('follows the page’s visibility', () => {
		document.body.innerHTML = '';
		const { host, canvas, ids } = setup();
		const tower = startTower(host, canvas, ids, [...lines], vi.fn());
		browser.frame(0);
		browser.intersect(host, { intersectionRatio: 1 });
		Object.defineProperty(document, 'hidden', { configurable: true, get: () => true });
		document.dispatchEvent(new Event('visibilitychange'));
		expect(browser.pendingFrames()).toBe(0);
		Object.defineProperty(document, 'hidden', { configurable: true, get: () => false });
		document.dispatchEvent(new Event('visibilitychange'));
		expect(browser.pendingFrames()).toBe(1);
		browser.intersect(host, { intersectionRatio: 0 });
		browser.frame(1);
		document.dispatchEvent(new Event('visibilitychange'));
		expect(browser.pendingFrames()).toBe(1);
		tower?.destroy();
	});

	test('relays out on resize and when fonts arrive', async () => {
		document.body.innerHTML = '';
		Object.defineProperty(document, 'fonts', {
			configurable: true,
			value: { ready: Promise.resolve() }
		});
		const { host, canvas, ids } = setup();
		const tower = startTower(host, canvas, ids, [...lines], vi.fn());
		const r = fake.renderers.at(-1);
		await tick();
		expect(r.setSize).toHaveBeenCalledTimes(2);
		browser.resize();
		expect(r.setSize).toHaveBeenCalledTimes(3);
		tower?.destroy();
		// @ts-ignore
		delete document.fonts;
	});

	test('a theme change repaints it, dark or light', async () => {
		document.body.innerHTML = '';
		const { host, canvas, ids } = setup();
		const tower = startTower(host, canvas, ids, [...lines], vi.fn());
		browser.frame(0);
		document.documentElement.classList.add('dark');
		await tick();
		expect(browser.pendingFrames()).toBe(1);
		browser.frame(16);
		document.documentElement.classList.remove('dark');
		await tick();
		browser.frame(32);
		tower?.destroy();
	});

	test('under reduced motion it redraws only when the reader scrolls', () => {
		browser.media.reduce = true;
		document.body.innerHTML = '';
		const { host, canvas, ids } = setup();
		const tower = startTower(host, canvas, ids, [...lines], vi.fn());
		browser.frame(0);
		browser.intersect(host, { intersectionRatio: 1 });
		browser.frame(16);
		expect(browser.pendingFrames()).toBe(0);
		fake.onScroll?.();
		expect(browser.pendingFrames()).toBe(1);
		browser.frame(32);
		tower?.hot(1);
		expect(browser.pendingFrames()).toBe(1);
		browser.frame(48);
		tower?.destroy();
		expect(fake.scrollStop).toHaveBeenCalled();
	});

	test('copes with a single station, a missing section and an empty rail', () => {
		document.body.innerHTML = '';
		const one = setup(1);
		const t1 = startTower(one.host, one.canvas, ['missing'], ['contact'], vi.fn());
		browser.frame(0);
		browser.frame(16);
		t1?.destroy();

		document.body.innerHTML = '';
		const host = document.createElement('div');
		host.getBoundingClientRect = () => rect(0, 0, 0);
		const t0 = startTower(host, document.createElement('canvas'), [], [], vi.fn());
		browser.frame(0);
		t0?.destroy();
	});

	test('stations without a link, and a browser without a pixel ratio', () => {
		document.body.innerHTML = '';
		Object.defineProperty(window, 'devicePixelRatio', { configurable: true, value: 0 });
		const { host, canvas, ids } = setup(2);
		const tower = startTower(
			host,
			canvas,
			[...ids, 'extra'],
			['work', 'writing', 'contact'],
			vi.fn()
		);
		expect(fake.renderers.at(-1).setPixelRatio).toHaveBeenCalledWith(1);
		browser.frame(0);
		tower?.destroy();
		Object.defineProperty(window, 'devicePixelRatio', { configurable: true, value: 1 });
	});

	test('reads the spine’s position from the stylesheet', () => {
		document.body.innerHTML = '';
		const { host, canvas, ids } = setup();
		const real = window.getComputedStyle;
		vi.spyOn(window, 'getComputedStyle').mockImplementation((el) =>
			el === host ? /** @type {any} */ ({ getPropertyValue: () => '60px' }) : real(el)
		);
		startTower(host, canvas, ids, [...lines], vi.fn())?.destroy();
	});
});
