import { describe, expect, test, vi } from 'vitest';
import { browser, fakeGl } from '../../setup/dom.js';
import { startNetwork } from '#lib/network.js';

const tick = () => new Promise((r) => setTimeout(r, 0));

/** A rectangle for getBoundingClientRect. */
const rect = (x = 0, y = 0, width = 0, height = 0) =>
	/** @type {DOMRect} */ ({
		x,
		y,
		left: x,
		top: y,
		width,
		height,
		right: x + width,
		bottom: y + height,
		toJSON() {}
	});

/**
 * A host of the given size with door markers and calm boxes inside, and a canvas whose context is
 * the fake.
 */
function setup({ width = 1200, height = 700, doors = true, calm = 2, gl = fakeGl() } = {}) {
	const host = document.createElement('div');
	host.getBoundingClientRect = () => rect(0, 0, width, height);
	if (doors)
		['work', 'writing', 'contact'].forEach((name, i) => {
			const el = document.createElement('a');
			el.dataset.routeStart = name;
			el.getBoundingClientRect = () => rect(100, 200 + i * 60, 160, 40);
			host.append(el);
		});
	for (let i = 0; i < calm; i++) {
		const el = document.createElement('div');
		el.dataset.calm = '';
		el.getBoundingClientRect = () => rect(40, 40 + i * 100, 300, 80);
		host.append(el);
	}
	const canvas = document.createElement('canvas');
	host.append(canvas);
	document.body.append(host);
	canvas.getContext = /** @type {any} */ (vi.fn(() => gl));
	return { host, canvas, gl };
}

/** The last value passed for a uniform. */
const uniform = (/** @type {any} */ gl, /** @type {string} */ fn, /** @type {string} */ name) =>
	gl[fn].mock.calls
		.filter((/** @type {any[]} */ c) => c[0]?.name === name)
		.at(-1)
		?.slice(1);

describe('startNetwork', () => {
	test('without WebGL2 there is no map', () => {
		const { host, canvas } = setup({ gl: /** @type {any} */ (null) });
		expect(startNetwork(host, canvas)).toBeNull();
	});

	test('a shader that fails to compile leaves no map', () => {
		const error = vi.spyOn(console, 'error').mockImplementation(() => {});
		const { host, canvas } = setup({ gl: fakeGl({ getShaderParameter: () => false }) });
		expect(startNetwork(host, canvas)).toBeNull();
		expect(error.mock.calls[0][1].message).toBe('shader log');
		const quiet = setup({
			gl: fakeGl({ getShaderParameter: () => false, getShaderInfoLog: () => '' })
		});
		expect(startNetwork(quiet.host, quiet.canvas)).toBeNull();
		expect(error.mock.calls[1][1].message).toBe('shader compile failed');
	});

	test('a program that fails to link leaves no map', () => {
		const error = vi.spyOn(console, 'error').mockImplementation(() => {});
		const a = setup({ gl: fakeGl({ getProgramParameter: () => false }) });
		expect(startNetwork(a.host, a.canvas)).toBeNull();
		expect(error.mock.calls[0][1].message).toBe('program log');
		const b = setup({
			gl: fakeGl({ getProgramParameter: () => false, getProgramInfoLog: () => null })
		});
		expect(startNetwork(b.host, b.canvas)).toBeNull();
		expect(error.mock.calls[1][1].message).toBe('program link failed');
	});

	test('draws the routes from the doors, with calm boxes and stations', () => {
		const { host, canvas, gl } = setup();
		const stop = startNetwork(host, canvas);
		expect(stop).toBeTypeOf('function');
		expect(canvas.width).toBeGreaterThan(0);
		expect(gl.viewport).toHaveBeenCalledWith(0, 0, canvas.width, canvas.height);
		const [segN] = uniform(gl, 'uniform1i', 'uSegN');
		const [stN] = uniform(gl, 'uniform1i', 'uStN');
		expect(segN).toBeGreaterThan(20);
		expect(stN).toBeGreaterThan(6);
		const [mask] = uniform(gl, 'uniform4fv', 'uMask');
		// two calm boxes, padded by 8px; the rest pushed off the canvas
		expect(mask.slice(0, 4)).toEqual([32, 32, 348, 128]);
		expect(mask.slice(8)).toEqual([-9999, -9999, -9999, -9999, -9999, -9999, -9999, -9999]);
		// the first door route starts 22px right of its marker, at its middle
		const [seg] = uniform(gl, 'uniform4fv', 'uSeg');
		expect([seg[0], seg[1]]).toEqual([282, 220]);
		expect(gl.enable).toHaveBeenCalledWith(gl.BLEND);
		stop?.();
	});

	test('without door markers, door routes start where the options say, or a default', () => {
		const a = setup({ doors: false, calm: 5 });
		startNetwork(a.host, a.canvas, { starts: [[0.5, 0.5], null] })?.();
		const [seg] = uniform(a.gl, 'uniform4fv', 'uSeg');
		expect([seg[0], seg[1]]).toEqual([600, 350]);
		// the second door has no start, so its route begins at the default spot
		const segs = uniform(a.gl, 'uniform4fv', 'uSeg')[0];
		const info = uniform(a.gl, 'uniform2fv', 'uSegInfo')[0];
		const firstOfRoute1 = [...info].findIndex((v, i) => i % 2 === 0 && v === 1) / 2;
		expect([segs[firstOfRoute1 * 4], segs[firstOfRoute1 * 4 + 1]]).toEqual([840, 455]);

		const b = setup({ doors: false });
		startNetwork(b.host, b.canvas)?.();
		const [segB] = uniform(b.gl, 'uniform4fv', 'uSeg');
		expect([segB[0], segB[1]]).toEqual([840, 385]);
	});

	test('a narrow screen gets the narrow plan, smaller rings and quieter lines', () => {
		const { host, canvas, gl } = setup({ width: 400, height: 800 });
		startNetwork(host, canvas, { narrowAlpha: 0.5, focus: 1 })?.();
		const [seg] = uniform(gl, 'uniform4fv', 'uSeg');
		expect(seg[0]).toBe(100 + 160 + 12);
		const [alpha] = uniform(gl, 'uniform1fv', 'uAlpha');
		// dark is off: work and contact dimmed for focus, everything halved for narrow
		expect(alpha[0]).toBeCloseTo(0.95 * 0.5 * 0.32);
		expect(alpha[1]).toBeCloseTo(0.95 * 0.5);
		expect(alpha[3]).toBeCloseTo(0.5 * 0.5);
	});

	test('a narrow screen without narrowAlpha keeps full strength', () => {
		const { host, canvas, gl } = setup({ width: 400, height: 800 });
		startNetwork(host, canvas)?.();
		expect(uniform(gl, 'uniform1fv', 'uAlpha')[0][0]).toBeCloseTo(0.95);
	});

	test('a browser that reports no pixel ratio is taken as 1', () => {
		Object.defineProperty(window, 'devicePixelRatio', { configurable: true, value: 0 });
		const { host, canvas } = setup({ width: 300, height: 200 });
		startNetwork(host, canvas)?.();
		expect(canvas.width).toBe(300);
		Object.defineProperty(window, 'devicePixelRatio', { configurable: true, value: 1 });
	});

	test('a resize while animating measures again without an extra frame', () => {
		const { host, canvas, gl } = setup();
		const stop = startNetwork(host, canvas);
		browser.intersect(host);
		const before = gl.viewport.mock.calls.length;
		browser.resize();
		expect(gl.viewport.mock.calls.length).toBe(before + 1);
		expect(browser.pendingFrames()).toBe(1);
		stop?.();
	});

	test('starting while a redraw is already queued reuses it', async () => {
		const { host, canvas } = setup();
		const stop = startNetwork(host, canvas);
		document.documentElement.classList.add('dark');
		await tick();
		expect(browser.pendingFrames()).toBe(1);
		browser.intersect(host);
		expect(browser.pendingFrames()).toBe(1);
		stop?.();
	});

	test('a tiny host is measured as at least one pixel', () => {
		const { host, canvas } = setup({ width: 0, height: 0 });
		startNetwork(host, canvas)?.();
		expect(canvas.width).toBeGreaterThanOrEqual(1);
	});

	test('animates while visible and stops when hidden or off screen', () => {
		const { host, canvas, gl } = setup();
		const stop = startNetwork(host, canvas);
		browser.intersect(host);
		expect(browser.pendingFrames()).toBe(1);
		browser.intersect(host); // already running: no second loop
		expect(browser.pendingFrames()).toBe(1);
		browser.frame(1000);
		browser.frame(1016);
		expect(gl.drawArrays).toHaveBeenCalledTimes(2);
		expect(uniform(gl, 'uniform1f', 'uTime')[0]).toBeCloseTo(0.016);
		expect(uniform(gl, 'uniform1f', 'uPulse')[0]).toBe(1);

		browser.intersect(host, { isIntersecting: false });
		expect(browser.pendingFrames()).toBe(0);

		Object.defineProperty(document, 'hidden', { configurable: true, get: () => true });
		browser.intersect(host);
		expect(browser.pendingFrames()).toBe(0);
		document.dispatchEvent(new Event('visibilitychange'));
		expect(browser.pendingFrames()).toBe(0);
		Object.defineProperty(document, 'hidden', { configurable: true, get: () => false });
		document.dispatchEvent(new Event('visibilitychange'));
		expect(browser.pendingFrames()).toBe(1);
		stop?.();
		expect(browser.pendingFrames()).toBe(0);
	});

	test('when hidden while off screen, becoming visible again does not start it', () => {
		const { host, canvas } = setup();
		const stop = startNetwork(host, canvas);
		browser.intersect(host, { isIntersecting: false });
		document.dispatchEvent(new Event('visibilitychange'));
		expect(browser.pendingFrames()).toBe(0);
		stop?.();
	});

	test('slow frames step the resolution down, but not below about 0.55', () => {
		const { host, canvas } = setup();
		const stop = startNetwork(host, canvas);
		browser.intersect(host);
		const start = canvas.width;
		let t = 0;
		for (let i = 0; i < 400; i++) browser.frame((t += 60));
		expect(canvas.width).toBeLessThan(start);
		expect(canvas.width).toBeGreaterThanOrEqual(Math.floor(start * 0.5));
		stop?.();
	});

	test('the cursor bends the lines; touches do not; leaving lets go', () => {
		const { host, canvas, gl } = setup();
		const stop = startNetwork(host, canvas);
		browser.intersect(host);
		const move = (/** @type {string} */ pointerType, x = 300, y = 200) => {
			const e = new MouseEvent('pointermove', { clientX: x, clientY: y });
			Object.defineProperty(e, 'pointerType', { value: pointerType });
			host.dispatchEvent(e);
		};
		move('touch');
		browser.frame(10);
		expect(uniform(gl, 'uniform2f', 'uMouse')).toEqual([-999, -999]);
		move('mouse');
		move('mouse', 320, 220); // already tracking: eases toward the new point
		browser.frame(20);
		const [x] = uniform(gl, 'uniform2f', 'uMouse');
		expect(x).toBeGreaterThan(300);
		expect(x).toBeLessThan(320);
		expect(uniform(gl, 'uniform1f', 'uMouseOn')[0]).toBeGreaterThan(0);
		expect(uniform(gl, 'uniform2f', 'uParallax')[0]).not.toBe(0);
		host.dispatchEvent(new Event('pointerleave'));
		for (let i = 0; i < 100; i++) browser.frame(30 + i * 16);
		expect(uniform(gl, 'uniform1f', 'uMouseOn')[0]).toBeLessThan(0.01);
		stop?.();
	});

	test('on a touch screen the cursor is not followed', () => {
		browser.media.coarse = true;
		const { host, canvas } = setup();
		const add = vi.spyOn(host, 'addEventListener');
		startNetwork(host, canvas)?.();
		expect(add.mock.calls.map((c) => c[0])).not.toContain('pointermove');
	});

	test('under reduced motion it draws one finished, still frame when needed', async () => {
		browser.media.reduce = true;
		const { host, canvas, gl } = setup();
		const stop = startNetwork(host, canvas);
		browser.intersect(host);
		expect(browser.pendingFrames()).toBe(1);
		browser.frame(5000);
		expect(browser.pendingFrames()).toBe(0);
		expect(uniform(gl, 'uniform1f', 'uDraw')).toEqual([1]);
		expect(uniform(gl, 'uniform1f', 'uTime')).toEqual([0]);
		expect(uniform(gl, 'uniform1f', 'uPulse')).toEqual([0]);
		expect(uniform(gl, 'uniform1f', 'uMouseOn')).toEqual([0]);
		expect(uniform(gl, 'uniform2f', 'uParallax')).toEqual([0, 0]);

		browser.resize();
		expect(browser.pendingFrames()).toBe(1);
		browser.resize(); // a redraw is already queued
		expect(browser.pendingFrames()).toBe(1);
		browser.frame(6000);
		Object.defineProperty(document, 'hidden', { configurable: true, get: () => false });
		document.dispatchEvent(new Event('visibilitychange'));
		expect(browser.pendingFrames()).toBe(1);
		stop?.();
	});

	test('a theme change recolours the map and redraws it', async () => {
		const { host, canvas, gl } = setup();
		const stop = startNetwork(host, canvas);
		expect(uniform(gl, 'uniform1f', 'uDark')).toEqual([0]);
		document.documentElement.classList.add('dark');
		await tick();
		expect(uniform(gl, 'uniform1f', 'uDark')).toEqual([1]);
		expect(browser.pendingFrames()).toBe(1);
		browser.frame(1);
		expect(uniform(gl, 'uniform1fv', 'uAlpha')[0][0]).toBeCloseTo(0.95 * 0.9);
		// while running, the next frame picks the change up on its own
		browser.intersect(host);
		document.documentElement.classList.remove('dark');
		await tick();
		expect(browser.pendingFrames()).toBe(1);
		stop?.();
	});

	test('under reduced motion a theme change redraws too', async () => {
		browser.media.reduce = true;
		const { host, canvas } = setup();
		const stop = startNetwork(host, canvas);
		document.documentElement.classList.add('dark');
		await tick();
		expect(browser.pendingFrames()).toBe(1);
		stop?.();
	});

	test('measures again once fonts are in', async () => {
		/** @type {() => void} */
		let ready = () => {};
		Object.defineProperty(document, 'fonts', {
			configurable: true,
			value: { ready: new Promise((r) => (ready = () => r(undefined))) }
		});
		const { host, canvas, gl } = setup();
		const stop = startNetwork(host, canvas);
		const before = gl.viewport.mock.calls.length;
		ready();
		await tick();
		expect(gl.viewport.mock.calls.length).toBe(before + 1);
		stop?.();

		browser.media.reduce = true;
		const b = setup();
		Object.defineProperty(document, 'fonts', {
			configurable: true,
			value: { ready: Promise.resolve() }
		});
		const stopB = startNetwork(b.host, b.canvas);
		await tick();
		expect(browser.pendingFrames()).toBe(1);
		stopB?.();
		// @ts-ignore
		delete document.fonts;
	});

	test('a lost context hides the canvas and stops for good', () => {
		const { host, canvas, gl } = setup();
		const stop = startNetwork(host, canvas);
		browser.intersect(host);
		const lost = new Event('webglcontextlost', { cancelable: true });
		canvas.dispatchEvent(lost);
		expect(lost.defaultPrevented).toBe(true);
		expect(canvas.style.display).toBe('none');
		expect(browser.pendingFrames()).toBe(0);
		browser.intersect(host);
		expect(browser.pendingFrames()).toBe(0);
		document.documentElement.classList.add('dark');
		browser.frame(1);
		expect(gl.drawArrays).not.toHaveBeenCalled();
		stop?.();
	});

	test('a frame that arrives after the context is lost draws nothing', () => {
		const { host, canvas, gl } = setup();
		const stop = startNetwork(host, canvas);
		browser.intersect(host);
		const frames = browser.pendingFrames();
		// the loss lands between scheduling and running the frame
		canvas.dispatchEvent(new Event('webglcontextlost', { cancelable: true }));
		expect(frames).toBe(1);
		browser.frame(1);
		expect(gl.drawArrays).not.toHaveBeenCalled();
		stop?.();
	});

	test('cleanup lets go of everything and the context', () => {
		const lose = vi.fn();
		const { host, canvas } = setup({ gl: fakeGl({ getExtension: () => ({ loseContext: lose }) }) });
		const stop = startNetwork(host, canvas);
		stop?.();
		expect(lose).toHaveBeenCalled();
		expect(browser.observers('resize')).toHaveLength(0);
		expect(browser.observers('intersection')).toHaveLength(0);
		const other = setup({ gl: fakeGl({ getExtension: () => null }) });
		startNetwork(other.host, other.canvas)?.();
	});
});
