// CPU budget check: Cloudflare's Free plan stops a request after 10 ms of CPU. This drives the
// production build in process, with the CMS's answers recorded once and replayed, and measures the
// CPU each request costs this thread (process.threadCpuUsage: not process.cpuUsage, which adds
// Node's background GC and JIT threads). Fails when a route's p95 is over budget; p99 swings by a
// millisecond or two between runs (GC, JIT, a ~1 ms clock), so it is reported, and flagged, only.
//
//   npm run build && npm run test:perf
//
// PERF_BUDGET_MS overrides the 10 ms budget; PERF_RUNS sets the measured requests per route.
import { writeFile } from 'node:fs/promises';
import { start } from '../system/app.js';

const BUDGET = Number(process.env.PERF_BUDGET_MS ?? 10);
const RUNS = Number(process.env.PERF_RUNS ?? 150);
const WARMUP = 40;

const ROUTES = [
	'/',
	'/blog',
	'/blog?page=2',
	'/blog?q=post',
	'/blog/category/technology',
	'/blog/tag/rail',
	'/blog/post-1',
	'/blog/post-24',
	'/blog/posts.json?page=2',
	'/blog/feed',
	'/sitemap.xml',
	'/projects',
	'/project/home-lab',
	'/now',
	'/links',
	'/sshkey',
	'/no-such-page'
];

const { respond } = await start({ replay: true });

/** CPU milliseconds one request costs this thread, body included. */
async function measure(/** @type {string} */ path) {
	const request = new Request(`https://alexwang.net${path}`, {
		headers: { accept: 'text/html' }
	});
	const before = process.threadCpuUsage();
	const res = await respond(request);
	await res.arrayBuffer();
	const used = process.threadCpuUsage(before);
	return { ms: (used.user + used.system) / 1000, status: res.status };
}

const pct = (/** @type {number[]} */ sorted, /** @type {number} */ p) =>
	sorted[Math.min(sorted.length - 1, Math.ceil((p / 100) * sorted.length) - 1)];

/** @type {{ route: string, status: number, p50: number, p95: number, p99: number, max: number }[]} */
const rows = [];
for (const route of ROUTES) {
	let status = 0;
	for (let i = 0; i < WARMUP; i++) status = (await measure(route)).status;
	globalThis.gc?.();
	const times = [];
	for (let i = 0; i < RUNS; i++) times.push((await measure(route)).ms);
	times.sort((a, b) => a - b);
	rows.push({
		route,
		status,
		p50: pct(times, 50),
		p95: pct(times, 95),
		p99: pct(times, 99),
		max: times[times.length - 1]
	});
}

const fmt = (/** @type {number} */ n) => n.toFixed(2).padStart(7);
console.log(`CPU per request (ms), ${RUNS} runs each; budget: p95 under ${BUDGET} ms\n`);
console.log(`${'route'.padEnd(28)} status     p50     p95     p99     max`);
for (const r of rows)
	console.log(
		`${r.route.padEnd(28)} ${String(r.status).padEnd(6)}${fmt(r.p50)} ${fmt(r.p95)} ${fmt(r.p99)} ${fmt(r.max)}${r.p95 > BUDGET ? '  ✗ over budget' : r.p99 > BUDGET ? '  ! p99 over budget' : ''}`
	);

await writeFile(
	'perf-results.json',
	JSON.stringify({ budget: BUDGET, runs: RUNS, rows }, null, '\t')
);

const over = rows.filter((r) => r.p95 > BUDGET);
const broken = rows.filter((r) => r.status >= 500);
if (broken.length) console.error(`\nServer errors on: ${broken.map((r) => r.route).join(', ')}`);
if (over.length)
	console.error(
		`\nOver the ${BUDGET} ms CPU budget at p95: ${over.map((r) => r.route).join(', ')}`
	);
const tail = rows.filter((r) => r.p95 <= BUDGET && r.p99 > BUDGET);
if (tail.length)
	console.warn(
		`\nWithin budget at p95, but p99 is over it on: ${tail.map((r) => r.route).join(', ')}`
	);
process.exit(over.length || broken.length ? 1 : 0);
