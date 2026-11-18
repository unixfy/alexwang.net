import { describe, expect, test, vi } from 'vitest';
import { domain } from '#lib/url.js';
import { excerpt } from '#lib/excerpt.js';
import { parseOklch, cssColor } from '#lib/color.js';
import { year, monthYear, monthDay, fullDate, dateSpan, byRecency } from '#lib/date.js';
import { handle } from '../../../src/hooks.server.js';
import { variables } from '../../../src/env.js';

describe('domain', () => {
	test.each([
		['https://www.example.com/path', 'example.com'],
		['https://sub.example.com', 'sub.example.com'],
		['http://wwwexample.com', 'wwwexample.com'],
		['mailto:me@example.com', null],
		['not a url', null],
		['', null],
		[null, null],
		[undefined, null]
	])('%s → %s', (href, host) => expect(domain(href)).toBe(host));
});

describe('excerpt', () => {
	test('empty input gives an empty string', () => {
		expect(excerpt(null)).toBe('');
		expect(excerpt(undefined)).toBe('');
		expect(excerpt('')).toBe('');
	});

	test('strips tags, scripts and styles; block ends become spaces', () => {
		expect(
			excerpt('<p>One</p><p>Two<br>three<br/>four</p><script>alert(1)</script><style>p{}</style>')
		).toBe('One Two three four');
	});

	test('decodes named and numeric entities, and leaves malformed ones', () => {
		expect(excerpt('Tom &amp; Jerry &rsquo;s &#169; &#x263A; &AMP; &bogus;')).toBe(
			'Tom & Jerry ’s © ☺ & &bogus;'
		);
	});

	test('an escaped tag stays as text rather than being stripped', () => {
		expect(excerpt('&lt;b&gt;bold&lt;/b&gt;')).toBe('<b>bold</b>');
	});

	test('collapses whitespace', () => {
		expect(excerpt('  a \n\t b  ')).toBe('a b');
	});

	test('short text is returned whole; exactly max is not cut', () => {
		expect(excerpt('x'.repeat(160))).toBe('x'.repeat(160));
	});

	test('long text is cut at a word boundary with trailing punctuation dropped', () => {
		const text = 'alpha beta, gamma delta epsilon';
		expect(excerpt(text, 9)).toBe('alpha…');
		expect(excerpt(text, 12)).toBe('alpha beta…');
		expect(excerpt(text, 14)).toBe('alpha beta…');
		// the word at the cut is always dropped, even when the cut lands at its end
		expect(excerpt(text, 17)).toBe('alpha beta…');
		expect(excerpt(text, 18)).toBe('alpha beta, gamma…');
	});

	test('a single overlong word is cut mid-word', () => {
		expect(excerpt('abcdefghij', 4)).toBe('abcd…');
	});
});

describe('parseOklch', () => {
	test('returns null for anything that is not oklch', () => {
		expect(parseOklch('')).toBeNull();
		expect(parseOklch('rgb(0 0 0)')).toBeNull();
	});

	test('white and black', () => {
		const white = /** @type {number[]} */ (parseOklch('oklch(1 0 0)'));
		white.forEach((v) => expect(v).toBeCloseTo(1, 3));
		expect(parseOklch('oklch(0 0 0)')).toEqual([0, 0, 0]);
	});

	test('percent lightness equals the fraction', () => {
		expect(parseOklch('oklch(50% 0.1 200)')).toEqual(parseOklch('oklch(0.5 0.1 200)'));
	});

	test('out-of-gamut colours are clamped to 0..1', () => {
		const vivid = /** @type {number[]} */ (parseOklch('oklch(0.7 0.4 30)'));
		vivid.forEach((v) => {
			expect(v).toBeGreaterThanOrEqual(0);
			expect(v).toBeLessThanOrEqual(1);
		});
	});

	test('very dark values use the linear segment of the sRGB curve', () => {
		const [r] = /** @type {number[]} */ (parseOklch('oklch(0.05 0 0)'));
		expect(r).toBeGreaterThan(0);
		expect(r).toBeLessThan(0.01);
	});

	test('cssColor reads a property or falls back', () => {
		const style = /** @type {any} */ ({
			getPropertyValue: (/** @type {string} */ n) => (n === '--a' ? 'oklch(1 0 0)' : '')
		});
		expect(cssColor(style, '--a', [9, 9, 9])[0]).toBeCloseTo(1, 3);
		expect(cssColor(style, '--b', [9, 9, 9])).toEqual([9, 9, 9]);
	});
});

describe('dates', () => {
	test('formatters work in UTC and return empty for missing values', () => {
		expect(year('2024-01-01T00:00:00')).toBe('2024');
		expect(monthYear('2021-06-15')).toBe('06/2021');
		expect(monthDay('2021-06-05')).toBe('Jun 5');
		expect(fullDate('2021-06-05')).toBe('June 05, 2021');
		expect(fullDate(Date.UTC(2020, 0, 1))).toBe('January 01, 2020');
		expect(fullDate(new Date(Date.UTC(2020, 0, 1)))).toBe('January 01, 2020');
		for (const f of [year, monthYear, monthDay, fullDate]) {
			expect(f(null)).toBe('');
			expect(f(undefined)).toBe('');
			expect(f('')).toBe('');
		}
	});

	test('a formatter is built once and reused', () => {
		const spy = vi.spyOn(Intl, 'DateTimeFormat');
		year('2020-01-01');
		year('2021-01-01');
		expect(spy).not.toHaveBeenCalled();
	});

	test('dateSpan covers every combination', () => {
		expect(dateSpan('2021-06-01', '2022-01-01')).toBe('06/2021 – 01/2022');
		expect(dateSpan('2021-06-01', null)).toBe('06/2021 – Present');
		expect(dateSpan(null, '2022-01-01')).toBe('01/2022');
		expect(dateSpan(null, null)).toBe('');
	});

	test('byRecency: a missing date on either side sorts last', () => {
		expect(
			byRecency({ end_date: '2020' }, { end_date: '2020', start_date: '2019' })
		).toBeGreaterThan(0);
		expect(byRecency({ end_date: '2020', start_date: '2019' }, { end_date: '2020' })).toBeLessThan(
			0
		);
		expect(byRecency({ end_date: '2020' }, { end_date: '2020' })).toBe(0);
	});

	test('byRecency: ongoing first, then latest end, then latest start', () => {
		const rows = [
			{ id: 'old', start_date: '2010-01-01', end_date: '2012-01-01' },
			{ id: 'running-old', start_date: '2015-01-01', end_date: null },
			{ id: 'recent', start_date: '2018-01-01', end_date: '2020-01-01' },
			{ id: 'running-new', start_date: '2019-01-01' },
			{ id: 'recent-later-start', start_date: '2019-01-01', end_date: '2020-01-01' },
			{ id: 'no-dates' }
		];
		expect(rows.sort(byRecency).map((r) => r.id)).toEqual([
			'running-new',
			'running-old',
			'no-dates',
			'recent-later-start',
			'recent',
			'old'
		]);
	});
});

describe('hooks', () => {
	test('serializes only content-type, preloads text faces, js and css', async () => {
		/** @type {any} */
		let opts;
		const resolve = vi.fn(async (_e, o) => ((opts = o), new Response('ok')));
		const res = await handle({ event: /** @type {any} */ ({}), resolve });
		expect(await res.text()).toBe('ok');
		expect(opts.filterSerializedResponseHeaders('Content-Type')).toBe(true);
		expect(opts.filterSerializedResponseHeaders('cache-control')).toBe(false);
		expect(opts.preload({ type: 'font', path: '/archivo.woff2' })).toBe(true);
		expect(opts.preload({ type: 'font', path: '/public-sans.woff2' })).toBe(true);
		expect(opts.preload({ type: 'font', path: '/fa-solid.woff2' })).toBe(false);
		expect(opts.preload({ type: 'js', path: '/a.js' })).toBe(true);
		expect(opts.preload({ type: 'css', path: '/a.css' })).toBe(true);
		expect(opts.preload({ type: 'asset', path: '/a.png' })).toBe(false);
	});
});

describe('env', () => {
	test('every variable is optional: blank becomes undefined', async () => {
		const all = Object.entries(/** @type {Record<string, any>} */ (variables));
		expect(all.map(([k]) => k)).toEqual([
			'TURNSTILE_SITE_KEY',
			'TURNSTILE_SECRET_KEY',
			'DIRECTUS_COMMENTS_TOKEN'
		]);
		expect(all[0][1].public).toBe(true);
		for (const [, v] of all) {
			// defineEnvVars wraps a plain function as a Standard Schema
			const parse = async (/** @type {any} */ value) =>
				(await v.schema['~standard'].validate(value)).value;
			expect(await parse('')).toBeUndefined();
			expect(await parse(undefined)).toBeUndefined();
			expect(await parse('abc')).toBe('abc');
		}
	});
});
