import { describe, expect, test } from 'vitest';
import { inline, slugify, render, summarize } from '#lib/editorjs.js';

const doc = (/** @type {any[]} */ ...blocks) => ({ blocks });
const html = (/** @type {any} */ ...blocks) => render(doc(...blocks)).html;

describe('inline', () => {
	test('non-strings render as nothing', () => {
		expect(inline(undefined)).toBe('');
		expect(inline(42)).toBe('');
		expect(inline(null)).toBe('');
	});

	test('allowed tags are kept without their attributes', () => {
		expect(inline('<b class="x">b</b><STRONG>s</STRONG><i>i</i><em>e</em><u>u</u>')).toBe(
			'<b>b</b><strong>s</strong><i>i</i><em>e</em><u>u</u>'
		);
		expect(inline('<s>s</s><del>d</del><mark style="x">m</mark><sub>1</sub><sup>2</sup>')).toBe(
			'<s>s</s><del>d</del><mark>m</mark><sub>1</sub><sup>2</sup>'
		);
		expect(inline('<code class="inline-code">x</code>')).toBe('<code>x</code>');
	});

	test('br is kept; a closing br is dropped', () => {
		expect(inline('a<br>b<br/>c</br>')).toBe('a<br>b<br>c');
	});

	test('other tags and stray brackets are shown as text', () => {
		expect(inline('<script>alert("x")</script>')).toBe('&lt;script&gt;alert("x")&lt;/script&gt;');
		expect(inline('<img src=x onerror="y">')).toBe('&lt;img src=x onerror=&quot;y&quot;&gt;');
		expect(inline('1 < 2 and <3')).toBe('1 &lt; 2 and &lt;3');
	});

	test('links keep only a safe destination', () => {
		expect(inline('<a href="/blog">x</a>')).toBe('<a href="/blog">x</a>');
		expect(inline("<a href='#top'>x</a>")).toBe('<a href="#top">x</a>');
		expect(inline('<a href="mailto:a@b.c">x</a>')).toBe('<a href="mailto:a@b.c">x</a>');
		expect(inline('<a href="tel:+1">x</a>')).toBe('<a href="tel:+1">x</a>');
		expect(inline('<a href=" https://alexwang.net/x ">x</a>')).toBe(
			'<a href="https://alexwang.net/x">x</a>'
		);
		expect(inline('<a href="http://www.alexwang.net">x</a>')).toBe(
			'<a href="http://www.alexwang.net">x</a>'
		);
	});

	test('external links open in a new tab without an opener', () => {
		expect(inline('<a href="https://example.com/?a=1&amp;b=2">x</a>')).toBe(
			'<a href="https://example.com/?a=1&amp;b=2" rel="noopener" target="_blank">x</a>'
		);
		// a lookalike domain is external
		expect(inline('<a href="https://alexwang.net.evil.com">x</a>')).toContain('target="_blank"');
	});

	test('unsafe or missing destinations leave a bare anchor', () => {
		expect(inline('<a href="javascript:alert(1)">x</a>')).toBe('<a>x</a>');
		expect(inline('<a href="data:text/html,hi">x</a>')).toBe('<a>x</a>');
		expect(inline('<a name="x">x</a>')).toBe('<a>x</a>');
		expect(inline('<a href="x" onclick="y">x</a>')).toBe('<a>x</a>');
	});

	test('a quote inside a destination is escaped', () => {
		expect(inline(`<a href='/a"b'>x</a>`)).toBe('<a href="/a&quot;b">x</a>');
	});
});

describe('slugify', () => {
	test.each([
		['Getting Started', 'getting-started'],
		['  <b>Bold</b> &amp; brave! ', 'bold-brave'],
		['Café olé', 'cafe-ole'],
		['日本語 タイトル', '日本語-タイトル'],
		['!!!', ''],
		['A--B', 'a-b']
	])('%s → %s', (text, slug) => expect(slugify(text)).toBe(slug));
});

describe('render: documents', () => {
	test('accepts an object, JSON text, or nothing', () => {
		const d = doc({ type: 'paragraph', data: { text: 'hi' } });
		expect(render(d).html).toBe('<p>hi</p>');
		expect(render(JSON.stringify(d)).html).toBe('<p>hi</p>');
		expect(render('{not json')).toEqual({ html: '', headings: [], words: 0 });
		expect(render(null)).toEqual({ html: '', headings: [], words: 0 });
		expect(render({})).toEqual({ html: '', headings: [], words: 0 });
		expect(render(undefined, { count: false }).html).toBe('');
	});

	test('blocks are joined by newlines; unknown blocks vanish', () => {
		expect(
			html(
				{ type: 'paragraph', data: { text: 'a' } },
				{ type: 'mystery', data: {} },
				{ type: 'delimiter', data: {} }
			)
		).toBe('<p>a</p>\n\n<hr>');
	});
});

describe('render: blocks', () => {
	test('blank paragraphs are spacing and render as nothing', () => {
		expect(html({ type: 'paragraph', data: { text: '&nbsp;' } })).toBe('');
		expect(html({ type: 'paragraph', data: { text: '<br>' } })).toBe('');
		expect(html({ type: 'paragraph', data: { text: '   ' } })).toBe('');
		expect(html({ type: 'paragraph', data: {} })).toBe('');
	});

	test('headers: clamped level, unique ids, sections reported', () => {
		const r = render(
			doc(
				{ type: 'header', data: { text: 'Intro', level: 2 } },
				{ type: 'header', data: { text: 'Intro', level: 2 } },
				{ type: 'header', data: { text: 'Intro', level: 2 } },
				{ type: 'header', data: { text: 'Deep', level: 9 } },
				{ type: 'header', data: { text: 'Top', level: 1 } },
				{ type: 'header', data: { text: 'Bad', level: 'x' } },
				{ type: 'header', data: { text: '???', level: 3 } },
				{ type: 'header', data: { text: '', level: 2 } },
				{ type: 'header', data: {} }
			)
		);
		expect(r.html.split('\n').filter(Boolean)).toEqual([
			'<h2 id="intro">Intro</h2>',
			'<h2 id="intro-2">Intro</h2>',
			'<h2 id="intro-2-2">Intro</h2>',
			'<h6 id="deep">Deep</h6>',
			'<h2 id="top">Top</h2>',
			'<h2 id="bad">Bad</h2>',
			'<h3 id="section-6">???</h3>'
		]);
		expect(r.headings.map((h) => h.id)).toEqual(['intro', 'intro-2', 'intro-2-2', 'top', 'bad']);
	});

	test('lists: nested objects, legacy strings, ordered, empty', () => {
		expect(
			html({
				type: 'nestedlist',
				data: {
					style: 'ordered',
					items: [{ content: 'a', items: [{ content: 'a1', items: [] }] }, { content: 'b' }]
				}
			})
		).toBe('<ol><li>a<ol><li>a1</li></ol></li><li>b</li></ol>');
		expect(html({ type: 'list', data: { style: 'unordered', items: ['x', '<b>y</b>'] } })).toBe(
			'<ul><li>x</li><li><b>y</b></li></ul>'
		);
		expect(html({ type: 'list', data: { items: [] } })).toBe('');
		expect(html({ type: 'list', data: {} })).toBe('');
	});

	test('checklists', () => {
		expect(
			html({
				type: 'checklist',
				data: { items: [{ text: 'done', checked: true }, { text: 'todo' }] }
			})
		).toBe(
			'<ul class="checklist"><li><input type="checkbox" disabled checked aria-label="Done"> done</li><li><input type="checkbox" disabled aria-label="Not done"> todo</li></ul>'
		);
		expect(html({ type: 'checklist', data: {} })).toBe('<ul class="checklist"></ul>');
	});

	test('quotes with and without a caption', () => {
		expect(html({ type: 'quote', data: { text: 'Go', caption: 'Me' } })).toBe(
			'<blockquote><p>Go</p><cite>Me</cite></blockquote>'
		);
		expect(html({ type: 'quote', data: { text: 'Go' } })).toBe(
			'<blockquote><p>Go</p></blockquote>'
		);
	});

	test('code is escaped', () => {
		expect(html({ type: 'code', data: { code: '<a href="x">&</a>' } })).toBe(
			'<pre><code>&lt;a href=&quot;x&quot;&gt;&amp;&lt;/a&gt;</code></pre>'
		);
		expect(html({ type: 'code', data: {} })).toBe('<pre><code></code></pre>');
	});

	test('raw HTML passes through', () => {
		expect(html({ type: 'raw', data: { html: '<iframe src="x"></iframe>' } })).toBe(
			'<iframe src="x"></iframe>'
		);
		expect(html({ type: 'raw', data: {} })).toBe('');
	});
});

describe('render: images', () => {
	test('CMS images are resized, sized and lazy', () => {
		expect(
			html({
				type: 'image',
				data: {
					file: { url: 'https://cms.alexwang.net/assets/abc-1', width: 3200, height: 1600 },
					caption: 'A <b>"train"</b>',
					stretched: true,
					withBorder: true,
					withBackground: true
				}
			})
		).toBe(
			'<figure class="post-figure stretched bordered backed"><img src="https://cms.alexwang.net/assets/abc-1?format=webp&amp;width=1600" alt="A &quot;train&quot;" width="1600" height="800" loading="lazy" decoding="async"><figcaption>A <b>"train"</b></figcaption></figure>'
		);
	});

	test('small CMS images keep their size; unsized ones get the maximum width', () => {
		expect(
			html({
				type: 'image',
				data: { file: { url: 'https://cms.alexwang.net/assets/x', width: 800, height: 600 } }
			})
		).toContain(
			'src="https://cms.alexwang.net/assets/x?format=webp&amp;width=800" alt="" width="800" height="600"'
		);
		const unsized = html({
			type: 'image',
			data: { file: { url: 'https://cms.alexwang.net/assets/x', width: 0, height: 'x' } }
		});
		expect(unsized).toContain('width=1600"');
		expect(unsized).not.toContain(' width="');
	});

	test('other sources are used as they are, from file.url or url', () => {
		expect(html({ type: 'image', data: { url: 'https://example.com/a.png?x=1&y=2' } })).toBe(
			'<figure class="post-figure"><img src="https://example.com/a.png?x=1&amp;y=2" alt="" loading="lazy" decoding="async"></figure>'
		);
		// a CMS URL with a query is not a bare asset, so it is not rewritten
		expect(
			html({ type: 'image', data: { file: { url: 'https://cms.alexwang.net/assets/x?y=1' } } })
		).toContain('src="https://cms.alexwang.net/assets/x?y=1"');
	});

	test('an image without a source renders nothing', () => {
		expect(html({ type: 'image', data: {} })).toBe('');
		expect(html({ type: 'image', data: null })).toBe('');
	});
});

describe('render: tables', () => {
	test('a headed table labels cells and marks a closing total row', () => {
		expect(
			html({
				type: 'table',
				data: {
					withHeadings: true,
					content: [
						['Item', '<b>Cost</b>', null],
						['Fare', '$2', 'x'],
						['Total', '$2', null]
					]
				}
			})
		).toBe(
			'<div class="table-scroll"><table><thead><tr><th scope="col">Item</th><th scope="col"><b>Cost</b></th><th scope="col"></th></tr></thead><tbody>' +
				'<tr><th scope="row">Fare</th><td data-label="Cost">$2</td><td>x</td></tr>' +
				'<tr class="total"><th scope="row">Total</th><td data-label="Cost">$2</td><td></td></tr>' +
				'</tbody></table></div>'
		);
	});

	test('a plain table has no header row; a total row only counts when last', () => {
		expect(
			html({
				type: 'table',
				data: {
					content: [
						['Total', '1'],
						['b', null],
						[null, 'c']
					]
				}
			})
		).toBe(
			'<div class="table-scroll"><table><tbody><tr><td>Total</td><td>1</td></tr><tr><td>b</td><td></td></tr><tr><td></td><td>c</td></tr></tbody></table></div>'
		);
	});

	test('an empty table renders nothing', () => {
		expect(html({ type: 'table', data: { content: [] } })).toBe('');
		expect(html({ type: 'table', data: null })).toBe('');
	});
});

describe('render: word counts', () => {
	test('paragraphs, quotes and lists count; headings and others do not', () => {
		const r = render(
			doc(
				{ type: 'paragraph', data: { text: 'one two <b>three</b>' } },
				{ type: 'header', data: { text: 'Not counted at all', level: 2 } },
				{ type: 'quote', data: { text: 'four five' } },
				{ type: 'list', data: { items: ['six', 'seven'] } },
				{ type: 'code', data: { code: 'not counted either' } },
				{ type: 'paragraph', data: {} },
				{ type: 'quote', data: {} },
				{ type: 'nestedlist', data: {} }
			)
		);
		// lists are counted over their JSON, as reading times always have been: ["six","seven"] is one
		// run of non-space, and so is an empty list's [] (3 + 2 + 1 + 1)
		expect(r.words).toBe(7);
		expect(r.headings).toEqual([
			{ id: 'not-counted-at-all', text: 'Not counted at all', before: 3 }
		]);
	});

	test('every kind of Unicode whitespace separates words, as \\s does', () => {
		const spaces = [
			' ',
			'\t',
			'\n',
			'\v',
			'\f',
			'\r',
			' ',
			' ',
			' ',
			' ',
			' ',
			' ',
			' ',
			' ',
			'　',
			'﻿'
		];
		const text = spaces.map((s, i) => `w${i}${s}`).join('');
		expect(render(doc({ type: 'paragraph', data: { text } })).words).toBe(spaces.length);
		expect(text.split(/\s+/).filter(Boolean)).toHaveLength(spaces.length);
		// characters above 127 that are not spaces join words
		expect(render(doc({ type: 'paragraph', data: { text: 'é​é ü' } })).words).toBe(2);
	});

	test('count: false skips counting', () => {
		const r = render(
			doc({ type: 'header', data: { text: 'H' } }, { type: 'paragraph', data: { text: 'a b' } }),
			{ count: false }
		);
		expect(r.words).toBe(0);
		expect(r.headings).toEqual([{ id: 'h', text: 'H', before: 0 }]);
	});
});

describe('summarize', () => {
	const d = doc(
		{ type: 'paragraph', data: { text: 'aaaa bbbb' } },
		{ type: 'header', data: { text: 'Head' } },
		{ type: 'paragraph', data: { text: 'cccc dddd' } },
		{ type: 'paragraph', data: { text: 'eeee' } }
	);

	test('with chars 0 it only counts', () => {
		expect(summarize(d, 0)).toEqual({ lead: '', words: 5 });
	});

	test('renders opening blocks until the text holds enough characters', () => {
		expect(summarize(d, 5)).toEqual({ lead: '<p>aaaa bbbb</p>', words: 5 });
		expect(summarize(d, 9)).toEqual({
			lead: '<p>aaaa bbbb</p>\n<h2 id="head">Head</h2>',
			words: 5
		});
		expect(summarize(JSON.stringify(d), 1000).lead.split('\n')).toHaveLength(4);
	});

	test('handles a missing body', () => {
		expect(summarize(null, 100)).toEqual({ lead: '', words: 0 });
	});
});
