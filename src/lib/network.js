// The Network: a living transit map drawn by one fragment shader behind the hero.
//
// Three routes begin exactly where the Work / Writing / Contact doors end, so the doors are
// real lines on the map. Three quieter routes cross them. Interchanges appear wherever routes
// meet. Light pulses run along every route, the map draws itself in on load, and the cursor
// bends the nearby lines like a lens. No dependencies; everything degrades to the plain page.

const MAX_SEG = 64;
const MAX_ST = 40;
const ROUTES = 6;

const VERT = `#version 300 es
void main() {
	vec2 p = vec2((gl_VertexID << 1) & 2, gl_VertexID & 2);
	gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}`;

const FRAG = `#version 300 es
precision highp float;
#define MAX_SEG ${MAX_SEG}
#define MAX_ST ${MAX_ST}
#define ROUTES ${ROUTES}

uniform vec2 uRes;          // canvas size, device px
uniform float uDpr;
uniform float uTime;
uniform float uDraw;        // 0..1 draw-in progress
uniform vec2 uMouse;        // css px
uniform float uMouseOn;     // 0..1
uniform vec2 uParallax;     // css px
uniform float uDark;
uniform float uPulse;
uniform vec3 uGround;
uniform vec3 uInk;
uniform vec3 uCol[ROUTES];
uniform float uHalf[ROUTES];
uniform float uAlpha[ROUTES];
uniform float uLen[ROUTES];
uniform float uSpeed[ROUTES];
uniform float uPhase[ROUTES];
uniform int uSegN;
uniform vec4 uSeg[MAX_SEG];
uniform vec2 uSegInfo[MAX_SEG];   // x route, y start length
uniform int uStN;
uniform vec4 uSt[MAX_ST];         // xy pos, z radius, w kind (route index, or -1 interchange)
uniform vec4 uMask[4];            // calm boxes (x0 y0 x1 y1), css px

out vec4 outColor;

float boxDist(vec2 p, vec4 b) {
	vec2 c = (b.xy + b.zw) * 0.5, h = (b.zw - b.xy) * 0.5;
	vec2 q = abs(p - c) - h;
	return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0);
}

void over(inout vec3 col, inout float a, vec3 c, float ca) {
	col = c * ca + col * (1.0 - ca);
	a = ca + a * (1.0 - ca);
}

void main() {
	vec2 frag = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y) / uDpr;
	vec2 p = frag - uParallax;

	// cursor lens: pull samples toward the cursor so nearby lines bulge and bend
	float lens = 0.0;
	if (uMouseOn > 0.001) {
		vec2 dm = p - uMouse;
		lens = exp(-dot(dm, dm) / (150.0 * 150.0));
		p = uMouse + dm * (1.0 - 0.38 * uMouseOn * lens);
	}

	float dmin[ROUTES];
	float smin[ROUTES];
	for (int r = 0; r < ROUTES; r++) { dmin[r] = 1e5; smin[r] = 0.0; }

	for (int i = 0; i < MAX_SEG; i++) {
		if (i >= uSegN) break;
		vec4 sg = uSeg[i];
		vec2 ba = sg.zw - sg.xy;
		vec2 pa = p - sg.xy;
		float len2 = dot(ba, ba);
		float h = clamp(dot(pa, ba) / len2, 0.0, 1.0);
		float d = length(pa - ba * h);
		int r = int(uSegInfo[i].x);
		if (d < dmin[r]) {
			dmin[r] = d;
			smin[r] = uSegInfo[i].y + h * sqrt(len2);
		}
	}

	vec3 col = vec3(0.0);
	float a = 0.0;

	for (int r = 0; r < ROUTES; r++) {
		float drawLen = uDraw * (uLen[r] + 160.0);
		float visible = 1.0 - smoothstep(drawLen - 6.0, drawLen, smin[r]);
		float core = (1.0 - smoothstep(uHalf[r] - 0.8, uHalf[r] + 0.8, dmin[r])) * visible;

		// light pulses: a comet with a tail, two per route
		float pulse = 0.0;
		for (int k = 0; k < 2; k++) {
			float span = uLen[r] + 220.0;
			float head = mod(uTime * uSpeed[r] + uPhase[r] + float(k) * span * 0.5, span) - 60.0;
			float behind = head - smin[r];
			float tail = behind > 0.0 ? exp(-behind / 70.0) : exp(behind / 6.0);
			pulse += tail;
		}
		pulse = clamp(pulse, 0.0, 1.0) * visible * uPulse;

		vec3 base = uCol[r];
		vec3 hot = mix(base * 0.55, mix(base, vec3(1.0), 0.75), uDark);
		vec3 c = mix(base, hot, pulse);

		// soft bloom around bright parts of the line (night map)
		float bloom = uDark * pulse * exp(-dmin[r] * dmin[r] / (2.0 * 7.0 * 7.0)) * 0.35;
		float ca = clamp(core * uAlpha[r] * (0.85 + 0.15 * pulse) + bloom, 0.0, 1.0);
		over(col, a, c, ca);
	}

	// stations
	for (int i = 0; i < MAX_ST; i++) {
		if (i >= uStN) break;
		vec4 st = uSt[i];
		float d = length(p - st.xy);
		float near = exp(-dot(st.xy - uMouse, st.xy - uMouse) / (130.0 * 130.0)) * uMouseOn;
		float R = st.z * (1.0 + 0.35 * near);
		float ring = (1.0 - smoothstep(R - 0.8, R + 0.8, d));
		float hole = (1.0 - smoothstep(R - 4.6, R - 3.6, d));
		vec3 rc = st.w < 0.0 ? uInk : uCol[int(st.w)];
		float sd = smoothstep(0.0, 1.0, uDraw * 2.4 - float(i) * 0.05);
		float rw = ring * sd;
		over(col, a, rc, rw * 0.96);
		over(col, a, uGround, hole * sd * 0.97);
	}

	// keep the type calm: fade the map where the hero copy sits
	float m = 1.0;
	for (int i = 0; i < 4; i++) {
		float db = boxDist(frag, uMask[i]);
		m = min(m, mix(0.1, 1.0, smoothstep(0.0, 110.0, db)));
	}
	// and let it dissolve into the page at the bottom edge
	float edge = smoothstep(0.0, 140.0, (uRes.y / uDpr) - frag.y);
	float k = m * edge;
	outColor = vec4(col * k, a * k);
}`;

/**
 * oklch(L C H) from a computed CSS value to sRGB 0..1
 * @param {string} value
 * @returns {number[] | null}
 */
function parseOklch(value) {
	const m = /oklch\(\s*([\d.]+)(%?)\s+([\d.]+)\s+([\d.]+)/.exec(value);
	if (!m) return null;
	const L = parseFloat(m[1]) / (m[2] ? 100 : 1);
	const C = parseFloat(m[3]);
	const H = (parseFloat(m[4]) * Math.PI) / 180;
	const a = C * Math.cos(H);
	const b = C * Math.sin(H);
	const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
	const mm = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
	const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
	const lin = [
		4.0767416621 * l - 3.3077115913 * mm + 0.2309699292 * s,
		-1.2684380046 * l + 2.6097574011 * mm - 0.3413193965 * s,
		-0.0041960863 * l - 0.7034186147 * mm + 1.707614701 * s
	];
	return lin.map((v) => {
		v = Math.min(1, Math.max(0, v));
		return v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055;
	});
}

/**
 * @param {CSSStyleDeclaration} style
 * @param {string} name
 * @param {number[]} fallback
 */
function cssColor(style, name, fallback) {
	return parseOklch(style.getPropertyValue(name)) ?? fallback;
}

// 8 compass steps in y-down screen space: E NE N NW W SW S SE
const DIRS = [
	[1, 0],
	[1, -1],
	[0, -1],
	[-1, -1],
	[-1, 0],
	[-1, 1],
	[0, 1],
	[1, 1]
];

/**
 * @param {number[]} start
 * @param {number[][]} steps compass index and length in cells
 * @param {number} g cell size, css px
 * @returns {number[][]}
 */
function walk(start, steps, g) {
	const pts = [start];
	let [x, y] = start;
	for (const [dir, n] of steps) {
		x += DIRS[dir][0] * n * g;
		y += DIRS[dir][1] * n * g;
		pts.push([x, y]);
	}
	return pts;
}

/**
 * Crossing point of segments a-b and c-d, or null.
 * @param {number[]} a
 * @param {number[]} b
 * @param {number[]} c
 * @param {number[]} d
 * @returns {number[] | null}
 */
function intersect(a, b, c, d) {
	const r = [b[0] - a[0], b[1] - a[1]];
	const s = [d[0] - c[0], d[1] - c[1]];
	const den = r[0] * s[1] - r[1] * s[0];
	if (Math.abs(den) < 1e-6) return null;
	const t = ((c[0] - a[0]) * s[1] - (c[1] - a[1]) * s[0]) / den;
	const u = ((c[0] - a[0]) * r[1] - (c[1] - a[1]) * r[0]) / den;
	if (t < 0.02 || t > 0.98 || u < 0.02 || u > 0.98) return null;
	return [a[0] + t * r[0], a[1] + t * r[1]];
}

/** Routes as text: compass step + length in grid cells ("NE6 E3"); no length means "off the canvas". */
/** @type {Record<string, number>} */
const COMPASS = { E: 0, NE: 1, N: 2, NW: 3, W: 4, SW: 5, S: 6, SE: 7 };
/** @param {string} text */
const route = (text) =>
	text.split(' ').map((t) => {
		const [, dir, n] = /** @type {RegExpExecArray} */ (/^([A-Z]+)(\d*)$/.exec(t));
		return [COMPASS[dir], n ? +n : 60];
	});

/**
 * Build routes and stations for a canvas of w x h css px.
 * @param {number} w
 * @param {number} h
 * @param {(number[] | null)[]} starts where each door line begins
 */
function build(w, h, starts) {
	const narrow = w < 700;
	const g = narrow ? 14 : Math.min(34, Math.max(24, w / 44));
	const sx = (/** @type {number} */ k) => starts[k]?.[0] ?? w * 0.7;
	const sy = (/** @type {number} */ k) => starts[k]?.[1] ?? h * (0.55 + 0.1 * k);

	// Wide: the door lines run out to the right. Narrow: there is no room to the right of the
	// arrows, so they turn back into the free space beside the portrait and below the rows.
	/** @type {[number[], string][]} */
	const plan = narrow
		? [
				[[sx(0), sy(0)], 'N3 NW8 W'],
				[[sx(1), sy(1)], 'NW4 N3 NW'],
				[[sx(2), sy(2)], 'SW3 W5 SW3 W'],
				[[w * 0.3, -g], 'SE9 E6 SE4 E'],
				[[w * 0.7, h + g], 'NE7 N6 NE'],
				[[w * 0.1, h * 0.97], 'NE3 E8 NE6 E']
			]
		: [
				// the three doors
				[[sx(0), sy(0)], 'E2 NE6 E3 NE4 N3 NE'],
				[[sx(1), sy(1)], 'E3 NE3 E6 SE2 E'],
				[[sx(2), sy(2)], 'E2 SE3 E5 NE2 E'],
				// the quiet network behind them
				[[w * 0.36, -g], 'SE7 E5 SE4 E'],
				[[w * 0.58, h + g], 'NE6 E4 NE5 E'],
				[[w * 0.4, h + g], 'NE2 E9 NE4 E']
			];
	const routes = plan.map(([start, text]) => walk(start, route(text), g));

	/** @type {{ a: number[]; b: number[]; r: number; start: number }[]} */
	const segs = [];
	/** @type {number[]} */
	const routeLen = [];
	routes.forEach((pts, r) => {
		let len = 0;
		for (let i = 0; i < pts.length - 1; i++) {
			const [a, b] = [pts[i], pts[i + 1]];
			segs.push({ a, b, r, start: len });
			len += Math.hypot(b[0] - a[0], b[1] - a[1]);
		}
		routeLen.push(len);
	});

	const stations = [];
	// a ring where each door line begins, and at alternate bends of the door lines
	for (let r = 0; r < 3; r++) {
		stations.push([...routes[r][0], narrow ? 7 : 10.5, r]);
		for (let i = 2; i < routes[r].length - 1; i += 2) stations.push([...routes[r][i], 8, r]);
	}
	// interchanges where different routes cross, kept inside the canvas
	for (let i = 0; i < segs.length; i++) {
		for (let j = i + 1; j < segs.length; j++) {
			if (segs[i].r === segs[j].r) continue;
			const p = intersect(segs[i].a, segs[i].b, segs[j].a, segs[j].b);
			if (!p || p[0] < 0 || p[0] > w || p[1] < 0 || p[1] > h) continue;
			if (stations.some((s) => Math.hypot(s[0] - p[0], s[1] - p[1]) < 30)) continue;
			stations.push([p[0], p[1], 9, -1]);
		}
	}
	return { segs: segs.slice(0, MAX_SEG), stations: stations.slice(0, MAX_ST), routeLen, g };
}

/**
 * @param {WebGL2RenderingContext} gl
 * @param {number} type
 * @param {string} src
 */
function compile(gl, type, src) {
	const sh = /** @type {WebGLShader} */ (gl.createShader(type));
	gl.shaderSource(sh, src);
	gl.compileShader(sh);
	if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
		throw new Error(gl.getShaderInfoLog(sh) || 'shader compile failed');
	}
	return sh;
}

/**
 * Start the network inside `host`, drawing on `canvas`.
 * Returns a cleanup function, or null when WebGL2 is unavailable (the page simply has no map).
 */
/**
 * @param {HTMLElement} host
 * @param {HTMLCanvasElement} canvas
 */
export function startNetwork(host, canvas) {
	const context = canvas.getContext('webgl2', {
		alpha: true,
		premultipliedAlpha: true,
		antialias: false,
		powerPreference: 'low-power'
	});
	if (!context) return null;
	// a plain constant, so the nested functions below keep the non-null type
	const gl = context;

	let prog;
	try {
		prog = gl.createProgram();
		gl.attachShader(prog, compile(gl, gl.VERTEX_SHADER, VERT));
		gl.attachShader(prog, compile(gl, gl.FRAGMENT_SHADER, FRAG));
		gl.linkProgram(prog);
		if (!gl.getProgramParameter(prog, gl.LINK_STATUS))
			throw new Error(gl.getProgramInfoLog(prog) ?? 'program link failed');
	} catch (err) {
		console.error('Network shader unavailable', err);
		return null;
	}
	gl.useProgram(prog);
	gl.bindVertexArray(gl.createVertexArray());

	/** @type {Record<string, WebGLUniformLocation | null>} */
	const U = {};
	const u = (/** @type {string} */ name) => (U[name] ??= gl.getUniformLocation(prog, name));

	const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
	const coarse = matchMedia('(pointer: coarse)').matches;
	const dprCap = coarse ? 1.25 : 1.5;
	const pixelBudget = coarse ? 0.9e6 : 1.4e6;
	let quality = 1;
	let last = 0;
	let ema = 16;
	let samples = 0;

	let w = 0;
	let h = 0;
	let dpr = 1;
	/** @type {ReturnType<typeof build>} */
	let net = { segs: [], stations: [], routeLen: [], g: 0 };
	let colors = { cols: /** @type {number[][]} */ ([]), ground: [0, 0, 0], ink: [0, 0, 0] };
	let dark = 0;
	let running = false;
	let raf = 0;
	let t0 = 0;
	let visible = true;
	let lost = false;
	const mouse = { x: -999, y: -999, tx: -999, ty: -999, on: 0, target: 0 };
	const parallax = { x: 0, y: 0, tx: 0, ty: 0 };

	function readTheme() {
		const root = document.documentElement;
		const st = getComputedStyle(root);
		dark = root.classList.contains('dark') ? 1 : 0;
		const brand = cssColor(st, '--line-work', [0.5, 0.1, 0.5]);
		const writing = cssColor(st, '--line-writing', [0.1, 0.5, 0.5]);
		const contact = cssColor(st, '--line-contact', [0.8, 0.5, 0.1]);
		const soft = cssColor(st, dark ? '--color-brand-400' : '--color-brand-300', brand);
		const grey = cssColor(st, dark ? '--color-gray-500' : '--color-gray-400', [0.6, 0.6, 0.6]);
		colors = {
			cols: [brand, writing, contact, soft, grey, writing],
			ground: cssColor(
				st,
				dark ? '--color-gray-950' : '--color-gray-50',
				dark ? [0.04, 0.03, 0.05] : [0.98, 0.98, 0.99]
			),
			ink: cssColor(
				st,
				dark ? '--color-gray-100' : '--color-gray-900',
				dark ? [0.95, 0.95, 0.96] : [0.1, 0.08, 0.1]
			)
		};
	}

	function measure() {
		const hr = host.getBoundingClientRect();
		w = Math.max(1, Math.round(hr.width));
		h = Math.max(1, Math.round(hr.height));
		dpr =
			Math.min(window.devicePixelRatio || 1, dprCap, Math.sqrt(pixelBudget / (w * h))) * quality;
		canvas.width = Math.round(w * dpr);
		canvas.height = Math.round(h * dpr);
		gl.viewport(0, 0, canvas.width, canvas.height);

		const starts = ['work', 'writing', 'contact'].map((name) => {
			const el = host.querySelector(`[data-route-start="${name}"]`);
			if (!el) return null;
			const r = el.getBoundingClientRect();
			return [r.right - hr.left + (w < 700 ? 12 : 22), r.top + r.height / 2 - hr.top];
		});
		net = build(w, h, starts);

		const boxes = [...host.querySelectorAll('[data-calm]')].slice(0, 4).map((el) => {
			const r = el.getBoundingClientRect();
			return [
				r.left - hr.left - 8,
				r.top - hr.top - 8,
				r.right - hr.left + 8,
				r.bottom - hr.top + 8
			];
		});
		while (boxes.length < 4) boxes.push([-9999, -9999, -9999, -9999]);
		gl.uniform4fv(u('uMask'), boxes.flat());

		const segData = new Float32Array(MAX_SEG * 4);
		const segInfo = new Float32Array(MAX_SEG * 2);
		net.segs.forEach((s, i) => {
			segData.set([s.a[0], s.a[1], s.b[0], s.b[1]], i * 4);
			segInfo.set([s.r, s.start], i * 2);
		});
		gl.uniform1i(u('uSegN'), net.segs.length);
		gl.uniform4fv(u('uSeg'), segData);
		gl.uniform2fv(u('uSegInfo'), segInfo);

		const stData = new Float32Array(MAX_ST * 4);
		net.stations.forEach((s, i) => stData.set(s, i * 4));
		gl.uniform1i(u('uStN'), net.stations.length);
		gl.uniform4fv(u('uSt'), stData);

		const pad = (/** @type {number[]} */ a, /** @type {number} */ n, /** @type {number} */ v) =>
			Array.from({ length: n }, (_, i) => a[i] ?? v);
		gl.uniform1fv(u('uLen'), pad(net.routeLen, ROUTES, 1));
		gl.uniform1fv(u('uHalf'), [3.5, 3.5, 3.5, 2.25, 2.25, 2.25]);
		gl.uniform1fv(
			u('uAlpha'),
			[0.95, 0.95, 0.95, 0.5, 0.42, 0.42].map((v) => v * (dark ? 0.9 : 1))
		);
		gl.uniform1fv(u('uSpeed'), [210, 180, 160, 120, 100, 140]);
		gl.uniform1fv(u('uPhase'), [0, 90, 40, 220, 300, 60]);
		gl.uniform2f(u('uRes'), canvas.width, canvas.height);
		gl.uniform1f(u('uDpr'), dpr);
		applyTheme();
	}

	function applyTheme() {
		readTheme();
		gl.uniform3fv(u('uCol'), colors.cols.flat());
		gl.uniform3fv(u('uGround'), colors.ground);
		gl.uniform3fv(u('uInk'), colors.ink);
		gl.uniform1f(u('uDark'), dark);
		gl.uniform1fv(
			u('uAlpha'),
			[0.95, 0.95, 0.95, 0.5, 0.42, 0.42].map((v) => v * (dark ? 0.9 : 1))
		);
	}

	/** @param {number} now */
	function frame(now) {
		raf = 0;
		if (lost) return;
		if (!t0) t0 = now;
		const t = (now - t0) / 1000;

		// if frames run long, step the resolution down (lines stay crisp enough at ~0.6x)
		if (last) {
			ema += (Math.min(now - last, 250) - ema) * 0.1;
			samples++;
		}
		last = now;
		if (!reduced && samples > 45 && ema > 26 && quality > 0.55) {
			quality *= 0.8;
			samples = 0;
			ema = 16;
			measure();
		}
		const ease = (/** @type {number} */ x) => 1 - (1 - Math.min(1, x)) ** 3;
		const draw = reduced ? 1 : ease(t / 2.4);

		// smooth the cursor and the parallax toward their targets
		mouse.x += (mouse.tx - mouse.x) * 0.18;
		mouse.y += (mouse.ty - mouse.y) * 0.18;
		mouse.on += (mouse.target - mouse.on) * 0.08;
		parallax.x += (parallax.tx - parallax.x) * 0.06;
		parallax.y += (parallax.ty - parallax.y) * 0.06;

		gl.uniform1f(u('uTime'), reduced ? 0 : t);
		gl.uniform1f(u('uPulse'), reduced ? 0 : 1);
		gl.uniform1f(u('uDraw'), draw);
		gl.uniform2f(u('uMouse'), mouse.x, mouse.y);
		gl.uniform1f(u('uMouseOn'), reduced ? 0 : mouse.on);
		gl.uniform2f(u('uParallax'), reduced ? 0 : parallax.x, reduced ? 0 : parallax.y);

		gl.clearColor(0, 0, 0, 0);
		gl.clear(gl.COLOR_BUFFER_BIT);
		gl.drawArrays(gl.TRIANGLES, 0, 3);

		// a reduced-motion visitor gets one finished still frame; everyone else animates while visible
		if (!reduced && running) raf = requestAnimationFrame(frame);
	}

	function start() {
		if (running || lost) return;
		running = true;
		last = 0;
		if (!raf) raf = requestAnimationFrame(frame);
	}
	function stop() {
		running = false;
		if (raf) cancelAnimationFrame(raf);
		raf = 0;
	}
	function redrawOnce() {
		if (!raf && !lost) raf = requestAnimationFrame((n) => ((running = false), frame(n)));
	}

	/** @param {PointerEvent} e */
	function onMove(e) {
		if (e.pointerType === 'touch') return;
		const r = host.getBoundingClientRect();
		mouse.tx = e.clientX - r.left;
		mouse.ty = e.clientY - r.top;
		if (mouse.target === 0) {
			mouse.x = mouse.tx;
			mouse.y = mouse.ty;
		}
		mouse.target = 1;
		parallax.tx = (e.clientX / innerWidth - 0.5) * -14;
		parallax.ty = (e.clientY / innerHeight - 0.5) * -10;
	}
	function onLeave() {
		mouse.target = 0;
		parallax.tx = parallax.ty = 0;
	}
	/** @param {Event} e */
	function onLost(e) {
		e.preventDefault();
		lost = true;
		stop();
		canvas.style.display = 'none';
	}

	const ro = new ResizeObserver(() => {
		measure();
		if (reduced) redrawOnce();
	});
	const io = new IntersectionObserver(([entry]) => {
		visible = entry.isIntersecting;
		if (visible && !document.hidden) (reduced ? redrawOnce : start)();
		else stop();
	});
	const onVis = () => (document.hidden ? stop() : visible && (reduced ? redrawOnce() : start()));
	const mo = new MutationObserver(() => {
		applyTheme();
		if (reduced || !running) redrawOnce();
	});

	gl.enable(gl.BLEND);
	gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
	measure();
	ro.observe(host);
	io.observe(host);
	mo.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
	document.addEventListener('visibilitychange', onVis);
	canvas.addEventListener('webglcontextlost', onLost);
	if (!reduced && !coarse) {
		host.addEventListener('pointermove', onMove);
		host.addEventListener('pointerleave', onLeave);
	}
	// fonts change where the copy sits, so measure again once they are in
	document.fonts?.ready.then(() => {
		measure();
		if (reduced) redrawOnce();
	});

	return () => {
		stop();
		ro.disconnect();
		io.disconnect();
		mo.disconnect();
		document.removeEventListener('visibilitychange', onVis);
		host.removeEventListener('pointermove', onMove);
		host.removeEventListener('pointerleave', onLeave);
		canvas.removeEventListener('webglcontextlost', onLost);
		gl.getExtension('WEBGL_lose_context')?.loseContext();
	};
}
