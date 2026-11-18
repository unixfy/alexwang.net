// Browser APIs jsdom lacks, as small controllable stand-ins. Tests reach them through `browser`.
import '@testing-library/jest-dom/vitest';
import { afterEach, beforeEach, vi } from 'vitest';
import { resetPage, goto, onNavigate, navigateHooks } from '../helpers/app.svelte.js';

vi.mock('$app/state', () => import('../helpers/app.svelte.js'));
vi.mock('$app/navigation', () => import('../helpers/app.svelte.js'));
vi.mock('$app/forms', () => import('../helpers/app.svelte.js'));

/** @type {Set<FakeObserver>} */
const observers = new Set();

class FakeObserver {
	/** @param {Function} callback @param {any} [options] */
	constructor(callback, options) {
		this.callback = callback;
		this.options = options;
		/** @type {Set<Element>} */
		this.targets = new Set();
		observers.add(this);
	}
	/** @param {Element} el */
	observe(el) {
		this.targets.add(el);
	}
	/** @param {Element} el */
	unobserve(el) {
		this.targets.delete(el);
	}
	disconnect() {
		this.targets.clear();
		observers.delete(this);
	}
	takeRecords() {
		return [];
	}
}
class FakeIntersectionObserver extends FakeObserver {}
class FakeResizeObserver extends FakeObserver {}

/** @type {Map<number, FrameRequestCallback>} */
let frames = new Map();
let nextFrame = 1;

/** What media queries match; tests change it before mounting. */
const media = { reduce: false, coarse: false, wide: true };

/**
 * A MediaQueryList whose `matches` follows `media`, so a query made once at load (Svelte's
 * prefersReducedMotion) still sees each test's setting.
 * @param {string} query
 */
function matchMedia(query) {
	return {
		get matches() {
			return query.includes('reduced-motion')
				? media.reduce
				: query.includes('coarse')
					? media.coarse
					: query.includes('min-width')
						? media.wide
						: false;
		},
		media: query,
		onchange: null,
		addEventListener: vi.fn(),
		removeEventListener: vi.fn(),
		addListener: vi.fn(),
		removeListener: vi.fn(),
		dispatchEvent: vi.fn()
	};
}
window.matchMedia = /** @type {any} */ (matchMedia);

export const browser = {
	media,
	/** Every live observer of a kind. */
	observers: (/** @type {'intersection' | 'resize'} */ kind) =>
		[...observers].filter((o) =>
			kind === 'intersection'
				? o instanceof FakeIntersectionObserver
				: o instanceof FakeResizeObserver
		),
	/**
	 * Tell intersection observers watching `el` that it moved.
	 * @param {Element} el
	 * @param {Partial<IntersectionObserverEntry>} entry
	 */
	intersect(el, entry = {}) {
		for (const o of browser.observers('intersection'))
			if (o.targets.has(el))
				o.callback(
					[
						{
							target: el,
							isIntersecting: true,
							intersectionRatio: 1,
							boundingClientRect: el.getBoundingClientRect(),
							...entry
						}
					],
					o
				);
	},
	/** Fire every resize observer. */
	resize() {
		for (const o of browser.observers('resize')) o.callback([], o);
	},
	/** Run the animation frames queued so far, at time `now`. */
	frame(now = performance.now()) {
		const due = frames;
		frames = new Map();
		for (const cb of due.values()) cb(now);
		return due.size;
	},
	pendingFrames: () => frames.size
};

/** A WebGL2 context whose every method is a spy; shaders compile and programs link. */
export function fakeGl(overrides = {}) {
	/** @type {any} */
	const gl = {
		VERTEX_SHADER: 1,
		FRAGMENT_SHADER: 2,
		COMPILE_STATUS: 3,
		LINK_STATUS: 4,
		BLEND: 5,
		ONE: 6,
		ONE_MINUS_SRC_ALPHA: 7,
		COLOR_BUFFER_BIT: 8,
		TRIANGLES: 9,
		getShaderParameter: () => true,
		getProgramParameter: () => true,
		getShaderInfoLog: () => 'shader log',
		getProgramInfoLog: () => 'program log',
		getUniformLocation: (/** @type {any} */ _p, /** @type {string} */ name) => ({ name }),
		getExtension: () => ({ loseContext: vi.fn() }),
		...overrides
	};
	return new Proxy(gl, {
		get(target, key) {
			if (!(key in target)) target[key] = vi.fn(() => ({}));
			return target[key];
		}
	});
}

/** A 2D context good enough for drawing a gradient into a texture. */
const fake2d = () => ({
	createRadialGradient: () => ({ addColorStop: vi.fn() }),
	fillRect: vi.fn(),
	fillStyle: ''
});

beforeEach(() => {
	media.reduce = false;
	media.coarse = false;
	media.wide = true;
	frames = new Map();
	resetPage();
	goto.mockClear();
	onNavigate.mockClear();
	navigateHooks.length = 0;

	vi.stubGlobal('IntersectionObserver', FakeIntersectionObserver);
	vi.stubGlobal('ResizeObserver', FakeResizeObserver);
	vi.stubGlobal('requestAnimationFrame', (/** @type {FrameRequestCallback} */ cb) => {
		const id = nextFrame++;
		frames.set(id, cb);
		return id;
	});
	vi.stubGlobal('cancelAnimationFrame', (/** @type {number} */ id) => frames.delete(id));
	vi.stubGlobal('matchMedia', vi.fn(matchMedia));
	window.matchMedia = /** @type {any} */ (globalThis.matchMedia);
	HTMLCanvasElement.prototype.getContext = /** @type {any} */ (
		vi.fn(function (/** @type {string} */ kind) {
			return kind === '2d' ? fake2d() : null;
		})
	);
	// Svelte transitions run on the Web Animations API
	Element.prototype.animate = /** @type {any} */ (
		vi.fn(() => {
			const a = {
				cancel: vi.fn(),
				finish: vi.fn(),
				onfinish: /** @type {any} */ (null),
				currentTime: 0,
				playState: 'finished',
				finished: Promise.resolve()
			};
			queueMicrotask(() => a.onfinish?.());
			return a;
		})
	);
	Element.prototype.getAnimations = () => [];
	Element.prototype.scrollIntoView = vi.fn();
	window.scrollTo = /** @type {any} */ (vi.fn());
});

afterEach(() => {
	vi.useRealTimers();
	for (const o of [...observers]) o.disconnect();
	document.documentElement.className = '';
	delete document.documentElement.dataset.theme;
	localStorage.clear();
});
