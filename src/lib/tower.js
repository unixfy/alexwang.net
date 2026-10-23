// The Signal Tower: the page's own route map, stood up in the right-hand gutter.
//
// One spine is the line. Each section is a station on it (a ring standing on a hexagonal
// platform), the lit part of the spine runs down to a train that mirrors the reader's scroll
// position, and pulses fall from the top of the line and vanish at the train. Orthographic, tilted
// toward the viewer, and slowly turning as you read. The shortcuts themselves are ordinary links in
// the DOM: this file only draws beside them, in a column of its own, and measures them so every
// station sits exactly on its label's row. Nothing here reaches sideways into the label column:
// the platforms are symmetric about the spine and the rings always face the camera.

import {
	AdditiveBlending,
	BackSide,
	CanvasTexture,
	CapsuleGeometry,
	CircleGeometry,
	Color,
	CylinderGeometry,
	Group,
	Mesh,
	MeshBasicMaterial,
	NormalBlending,
	OrthographicCamera,
	PlaneGeometry,
	Scene,
	SRGBColorSpace,
	SphereGeometry,
	TorusGeometry,
	WebGLRenderer
} from 'three';
import { cssColor } from './color.js';

const SCALE = 64; // css px per world unit
const TILT = 0.5; // radians toward the viewer
const COS_TILT = Math.cos(TILT);
const SHELF = -0.3; // how far below its ring each platform sits (world units)

const lerp = (/** @type {number} */ a, /** @type {number} */ b, /** @type {number} */ t) =>
	a + (b - a) * t;
const clamp01 = (/** @type {number} */ x) => Math.min(1, Math.max(0, x));

/** @param {number[]} rgb */
const toColor = (rgb) => new Color().setRGB(rgb[0], rgb[1], rgb[2], SRGBColorSpace);

function glowTexture() {
	const c = document.createElement('canvas');
	c.width = c.height = 64;
	const g = /** @type {CanvasRenderingContext2D} */ (c.getContext('2d'));
	const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
	grad.addColorStop(0, 'rgba(255,255,255,1)');
	grad.addColorStop(0.35, 'rgba(255,255,255,0.35)');
	grad.addColorStop(1, 'rgba(255,255,255,0)');
	g.fillStyle = grad;
	g.fillRect(0, 0, 64, 64);
	return new CanvasTexture(c);
}

/**
 * @param {HTMLElement} host the rail; links marked [data-stop] sit inside it, one per station
 * @param {HTMLCanvasElement} canvas
 * @param {string[]} ids element ids of the sections, in page order
 * @param {('work' | 'writing' | 'contact')[]} lines which line colour each station wears
 * @param {(index: number) => void} onActive called when the current section changes
 * @returns {{ hot: (index: number) => void, destroy: () => void } | null} null when WebGL is unavailable
 */
export function startTower(host, canvas, ids, lines, onActive) {
	/** @type {WebGLRenderer} */
	let renderer;
	try {
		renderer = new WebGLRenderer({
			canvas,
			alpha: true,
			antialias: true,
			powerPreference: 'low-power'
		});
	} catch {
		return null;
	}
	renderer.setClearColor(0x000000, 0);

	const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
	const n = ids.length;

	const scene = new Scene();
	const camera = new OrthographicCamera(-1, 1, 1, -1, -50, 50);
	camera.position.z = 10;

	const tower = new Group();
	scene.add(tower);

	// ---------- geometry ----------
	const unitCyl = new CylinderGeometry(1, 1, 1, 12);
	const mats = {
		track: new MeshBasicMaterial(),
		lit: new MeshBasicMaterial(),
		slab: new MeshBasicMaterial(),
		side: new MeshBasicMaterial(),
		ground: new MeshBasicMaterial({ depthTest: false }),
		train: new MeshBasicMaterial({ depthTest: false }),
		trainEdge: new MeshBasicMaterial({ side: BackSide, depthTest: false }),
		pulse: new MeshBasicMaterial({ transparent: true, depthWrite: false })
	};

	const track = new Mesh(unitCyl, mats.track);
	const lit = new Mesh(unitCyl, mats.lit);
	track.scale.x = track.scale.z = 0.05;
	lit.scale.x = lit.scale.z = 0.075;
	tower.add(track, lit);

	const trainGeo = new CapsuleGeometry(0.1, 0.2, 4, 12);
	const train = new Mesh(trainGeo, mats.train);
	const trainEdge = new Mesh(trainGeo, mats.trainEdge);
	trainEdge.scale.setScalar(1.3);
	// the train rides in front of the rings, so it reads when it stops at a station
	trainEdge.renderOrder = 4;
	train.renderOrder = 5;
	train.add(trainEdge);
	tower.add(train);

	const pulseGeo = new SphereGeometry(0.06, 10, 8);
	const pulses = [0, 1, 2].map(() => {
		const m = new Mesh(pulseGeo, mats.pulse.clone());
		tower.add(m);
		return m;
	});

	const ringGeo = new TorusGeometry(0.2, 0.05, 10, 40);
	const fillGeo = new CircleGeometry(0.2, 40);
	const padGeo = new CylinderGeometry(0.44, 0.44, 0.1, 6);
	const glowGeo = new PlaneGeometry(1.1, 1.1);
	const glowMap = glowTexture();

	const stations = Array.from({ length: n }, (_, k) => {
		const lineMat = new MeshBasicMaterial({ depthTest: false });
		// side, top, bottom: the top takes a tint of its line while its station is current
		const top = new MeshBasicMaterial();
		const pad = new Mesh(padGeo, [mats.side, top, mats.side]);
		pad.position.y = SHELF;

		// the ring and the glow always face the camera, so the ring stays a true circle at any yaw
		const face = new Group();
		const ring = new Mesh(ringGeo, lineMat);
		ring.renderOrder = 3;
		const fill = new Mesh(fillGeo, mats.ground);
		fill.renderOrder = 2;
		ring.position.z = fill.position.z = 0.06;
		const glow = new Mesh(
			glowGeo,
			new MeshBasicMaterial({
				map: glowMap,
				transparent: true,
				depthWrite: false,
				depthTest: false
			})
		);
		glow.renderOrder = -1;
		face.add(glow, fill, ring);

		const g = new Group();
		g.add(pad, face);
		tower.add(g);
		return { g, face, top, glow, lineMat, scale: 1, tint: 0, glowA: 0.12, k };
	});

	// ---------- state ----------
	let w = 1;
	let h = 1;
	/** @type {number[]} */
	let ys = new Array(n).fill(0);
	let active = 0;
	let hotIndex = -1;
	let trainY = 0;
	let lean = 0;
	let running = false;
	let visible = true;
	let raf = 0;
	let last = 0;
	let t = 0;
	let dark = false;

	function applyPalette() {
		const st = getComputedStyle(document.documentElement);
		dark = document.documentElement.classList.contains('dark');
		const line = {
			work: cssColor(st, '--line-work', [0.5, 0.1, 0.5]),
			writing: cssColor(st, '--line-writing', [0.1, 0.5, 0.5]),
			contact: cssColor(st, '--line-contact', [0.8, 0.5, 0.1])
		};
		const ground = cssColor(st, dark ? '--color-gray-950' : '--color-gray-50', [0.97, 0.97, 0.98]);
		mats.track.color = toColor(
			cssColor(st, dark ? '--color-gray-700' : '--color-gray-300', [0.8, 0.8, 0.8])
		);
		mats.lit.color = toColor(line.work);
		mats.slab.color = toColor(
			cssColor(st, dark ? '--color-gray-800' : '--color-gray-200', [0.85, 0.85, 0.85])
		);
		mats.side.color = toColor(
			cssColor(st, dark ? '--color-gray-600' : '--color-gray-400', [0.6, 0.6, 0.6])
		);
		mats.ground.color = toColor(ground);
		mats.train.color = toColor(dark ? [1, 1, 1] : line.work);
		mats.trainEdge.color = toColor(ground);
		pulses.forEach((p) =>
			/** @type {MeshBasicMaterial} */ (p.material).color.set(dark ? 0xffffff : toColor(line.work))
		);
		stations.forEach((s) => {
			s.lineMat.color = toColor(line[lines[s.k]]);
			const gm = /** @type {MeshBasicMaterial} */ (s.glow.material);
			gm.color = toColor(line[lines[s.k]]);
			gm.blending = dark ? AdditiveBlending : NormalBlending;
		});
	}

	function layout() {
		const hr = host.getBoundingClientRect();
		w = Math.max(1, Math.round(hr.width));
		h = Math.max(1, Math.round(hr.height));
		const dpr = Math.min(window.devicePixelRatio || 1, 2, Math.sqrt(0.9e6 / (w * h)));
		renderer.setPixelRatio(dpr);
		renderer.setSize(w, h, false);
		camera.left = -w / 2 / SCALE;
		camera.right = w / 2 / SCALE;
		camera.top = h / 2 / SCALE;
		camera.bottom = -h / 2 / SCALE;
		camera.updateProjectionMatrix();

		// every station sits where its link is, so the labels and the 3D line can never drift apart
		const links = [...host.querySelectorAll('[data-stop]')];
		ys = links.map((a) => {
			const r = a.getBoundingClientRect();
			return (h / 2 - (r.top + r.height / 2 - hr.top)) / SCALE / COS_TILT;
		});
		// the spine's distance from the rail's left edge is defined once, in the stylesheet (--spine-x)
		const spinePx = parseFloat(getComputedStyle(host).getPropertyValue('--spine-x')) || 42;
		tower.position.set((spinePx - w / 2) / SCALE, 0, 0);
		stations.forEach((s, k) => s.g.position.set(0, ys[k] ?? 0, 0));

		const top = (ys[0] ?? 0) + 1.2;
		const bottom = (ys[n - 1] ?? 0) - 1.2;
		track.scale.y = top - bottom;
		track.position.y = (top + bottom) / 2;
		lit.userData.top = top;
		lit.userData.bottom = bottom;
		if (!trainY) trainY = ys[0] ?? 0;
	}

	/** where the reader is, as a station index and the train's height between stations */
	function progress() {
		const line = scrollY + innerHeight * 0.45;
		const tops = ids.map((id) => {
			const el = document.getElementById(id);
			return el ? el.getBoundingClientRect().top + scrollY : Infinity;
		});
		let i = 0;
		while (i + 1 < n && tops[i + 1] <= line) i++;
		const next = tops[i + 1];
		const frac = i + 1 < n && line > tops[i] ? clamp01((line - tops[i]) / (next - tops[i])) : 0;
		return { index: i, y: lerp(ys[i] ?? 0, ys[i + 1] ?? ys[i] ?? 0, frac) };
	}

	/** @param {number} now */
	function frame(now) {
		raf = 0;
		const dt = Math.min(0.1, last ? (now - last) / 1000 : 0.016);
		last = now;
		if (!reduced) t += dt;

		const p = progress();
		if (p.index !== active) {
			active = p.index;
			onActive(active);
		}
		const ease = reduced ? 1 : 1 - Math.exp(-dt * 9);
		trainY = lerp(trainY, p.y, ease);
		lean = lerp(lean, hotIndex >= 0 ? 0.12 : 0, reduced ? 1 : 1 - Math.exp(-dt * 6));

		const span = (ys[n - 1] ?? 0) - (ys[0] ?? 0) || 1;
		const overall = clamp01((trainY - (ys[0] ?? 0)) / span);
		const yaw = 0.3 + (reduced ? 0 : Math.sin(t * 0.4) * 0.06) + (overall - 0.5) * 0.9 + lean;
		tower.rotation.set(TILT, yaw, 0, 'XYZ');

		const top = lit.userData.top ?? 0;
		const litLen = Math.max(0.001, top - trainY);
		lit.scale.y = litLen;
		lit.position.y = top - litLen / 2;
		train.position.y = trainY;

		stations.forEach((s) => {
			const isActive = s.k === active;
			const isHot = s.k === hotIndex;
			const targetScale = (isActive ? 1.3 : 1) * (isHot ? 1.12 : 1);
			s.scale = lerp(s.scale, targetScale, ease * 0.9);
			s.face.scale.setScalar(s.scale);
			s.face.quaternion.copy(tower.quaternion).invert();
			s.tint = lerp(s.tint, isActive ? 0.5 : isHot ? 0.3 : 0, ease);
			s.top.color.copy(mats.slab.color).lerp(s.lineMat.color, s.tint);
			const target = (isActive ? 0.8 : isHot ? 0.5 : 0.06) * (dark ? 1 : 0.5);
			s.glowA = lerp(s.glowA, target, ease);
			/** @type {MeshBasicMaterial} */ (s.glow.material).opacity = s.glowA;
		});

		// pulses fall from the top of the line and disappear at the train
		const length = top - (lit.userData.bottom ?? 0);
		pulses.forEach((m, k) => {
			if (reduced) {
				m.visible = false;
				return;
			}
			const y = top - ((t * 0.9 + (k * length) / 3) % length);
			m.position.y = y;
			m.visible = y > trainY + 0.15;
			/** @type {MeshBasicMaterial} */ (m.material).opacity = clamp01((top - y) * 3) * 0.9;
		});

		renderer.render(scene, camera);
		if (running) raf = requestAnimationFrame(frame);
	}

	function request() {
		if (!raf) raf = requestAnimationFrame(frame);
	}
	function start() {
		if (running) return;
		running = true;
		last = 0;
		request();
	}
	function stop() {
		running = false;
		if (raf) cancelAnimationFrame(raf);
		raf = 0;
	}
	const refresh = () => (reduced || !running ? request() : undefined);

	// ---------- wiring ----------
	applyPalette();
	layout();

	const ro = new ResizeObserver(() => {
		layout();
		request();
	});
	ro.observe(host);
	// the sticky rail peeks into the first screen from below; only draw when a real part of it is showing
	const io = new IntersectionObserver(
		([entry]) => {
			visible = entry.intersectionRatio >= 0.3;
			if (visible && !document.hidden && !reduced) start();
			else {
				stop();
				request();
			}
		},
		{ threshold: [0, 0.3] }
	);
	io.observe(host);
	const mo = new MutationObserver(() => {
		applyPalette();
		refresh();
	});
	mo.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
	const onVis = () => (document.hidden ? stop() : visible && !reduced ? start() : request());
	document.addEventListener('visibilitychange', onVis);
	const onScroll = () => request();
	if (reduced) addEventListener('scroll', onScroll, { passive: true });
	document.fonts?.ready.then(() => {
		layout();
		request();
	});
	request();

	return {
		hot(index) {
			hotIndex = index;
			refresh();
		},
		destroy() {
			stop();
			ro.disconnect();
			io.disconnect();
			mo.disconnect();
			document.removeEventListener('visibilitychange', onVis);
			removeEventListener('scroll', onScroll);
			[unitCyl, trainGeo, pulseGeo, ringGeo, fillGeo, padGeo, glowGeo].forEach((g) => g.dispose());
			glowMap.dispose();
			Object.values(mats).forEach((m) => m.dispose());
			stations.forEach((s) => {
				s.lineMat.dispose();
				s.top.dispose();
				/** @type {MeshBasicMaterial} */ (s.glow.material).dispose();
			});
			pulses.forEach((p) => /** @type {MeshBasicMaterial} */ (p.material).dispose());
			renderer.dispose();
			renderer.forceContextLoss();
		}
	};
}
