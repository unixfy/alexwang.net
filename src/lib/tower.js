// The Signal Tower: the page's own route map, stood up in the right-hand gutter.
//
// One spine is the line. Each section is a station on it (a ring, a platform and a signal lamp),
// the lit part of the spine runs down to a train that mirrors the reader's scroll position, and
// pulses fall from the top of the line and vanish at the train. Orthographic, tilted toward the
// viewer, and slowly turning as you read. The shortcuts themselves are ordinary links in the DOM:
// this file only draws behind them, and measures them so every station sits exactly on its label.

import {
	AdditiveBlending,
	BackSide,
	BoxGeometry,
	CanvasTexture,
	CapsuleGeometry,
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
const SHELF = -0.64; // how far below its label each platform sits (world units)
const SPINE_PX = 42; // distance of the spine from the left edge of the rail

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
		train: new MeshBasicMaterial(),
		trainEdge: new MeshBasicMaterial({ side: BackSide }),
		pulse: new MeshBasicMaterial({ transparent: true, depthWrite: false })
	};

	const track = new Mesh(unitCyl, mats.track);
	const lit = new Mesh(unitCyl, mats.lit);
	track.scale.x = track.scale.z = 0.05;
	lit.scale.x = lit.scale.z = 0.075;
	tower.add(track, lit);

	const trainGeo = new CapsuleGeometry(0.13, 0.26, 4, 12);
	const train = new Mesh(trainGeo, mats.train);
	const trainEdge = new Mesh(trainGeo, mats.trainEdge);
	trainEdge.scale.setScalar(1.28);
	train.add(trainEdge);
	tower.add(train);

	const pulseGeo = new SphereGeometry(0.06, 10, 8);
	const pulses = [0, 1, 2].map(() => {
		const m = new Mesh(pulseGeo, mats.pulse.clone());
		tower.add(m);
		return m;
	});

	const ringGeo = new TorusGeometry(0.22, 0.055, 10, 36);
	const slabGeo = new BoxGeometry(1.7, 0.09, 1);
	const edgeGeo = new BoxGeometry(1.7, 0.12, 0.07);
	const postGeo = new CylinderGeometry(0.04, 0.04, 0.34, 8);
	const lampGeo = new SphereGeometry(0.1, 12, 10);
	const glowGeo = new PlaneGeometry(1.25, 1.25);
	const glowMap = glowTexture();

	const stations = Array.from({ length: n }, (_, k) => {
		const lineMat = new MeshBasicMaterial();
		const ring = new Mesh(ringGeo, lineMat);
		ring.rotation.x = Math.PI / 2;
		const slab = new Mesh(slabGeo, mats.slab);
		slab.position.set(0.95, SHELF, 0);
		const edge = new Mesh(edgeGeo, lineMat);
		edge.position.set(0.95, SHELF + 0.01, 0.5);
		const post = new Mesh(postGeo, mats.slab);
		post.position.set(0.42, SHELF + 0.2, 0.3);
		const lamp = new Mesh(lampGeo, lineMat);
		lamp.position.set(0.42, SHELF + 0.44, 0.3);
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
		glow.position.set(0, 0, 0);
		const g = new Group();
		g.add(glow, slab, edge, post, lamp, ring);
		tower.add(g);
		return { g, ring, lamp, glow, lineMat, scale: 1, glowA: 0.12, k };
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
		tower.position.set((SPINE_PX - w / 2) / SCALE, 0, 0);
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
		const yaw = 0.55 + (reduced ? 0 : Math.sin(t * 0.4) * 0.07) + (overall - 0.5) * 0.5 + lean;
		tower.rotation.set(TILT, yaw, 0, 'XYZ');

		const top = lit.userData.top ?? 0;
		const litLen = Math.max(0.001, top - trainY);
		lit.scale.y = litLen;
		lit.position.y = top - litLen / 2;
		train.position.y = trainY;

		stations.forEach((s) => {
			const isActive = s.k === active;
			const isHot = s.k === hotIndex;
			const targetScale = (isActive ? 1.45 : 1) * (isHot ? 1.2 : 1);
			s.scale = lerp(s.scale, targetScale, ease * 0.9);
			s.ring.scale.setScalar(s.scale);
			s.lamp.scale.setScalar(isActive || isHot ? 1.35 : 1);
			const target = (isActive ? 0.85 : isHot ? 0.55 : 0.1) * (dark ? 1 : 0.55);
			s.glowA = lerp(s.glowA, target, ease);
			/** @type {MeshBasicMaterial} */ (s.glow.material).opacity = s.glowA;
			s.glow.quaternion.copy(tower.quaternion).invert();
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
			[unitCyl, trainGeo, pulseGeo, ringGeo, slabGeo, edgeGeo, postGeo, lampGeo, glowGeo].forEach(
				(g) => g.dispose()
			);
			glowMap.dispose();
			Object.values(mats).forEach((m) => m.dispose());
			stations.forEach((s) => {
				s.lineMat.dispose();
				/** @type {MeshBasicMaterial} */ (s.glow.material).dispose();
			});
			pulses.forEach((p) => /** @type {MeshBasicMaterial} */ (p.material).dispose());
			renderer.dispose();
			renderer.forceContextLoss();
		}
	};
}
