import { decodeEntities } from '#lib/entities.js';

// Renders the post body, which the CMS stores as Editor.js blocks, to HTML. Inline text may carry
// the editor's own markup (links, bold, code...) and is cut down to an allowlist; the "raw" block is
// the owner's own HTML (embeds) and passes through untouched.

/** @param {string} s */
const esc = (s) =>
	s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const INLINE = new Set([
	'a',
	'b',
	'strong',
	'i',
	'em',
	'u',
	's',
	'del',
	'mark',
	'code',
	'sub',
	'sup',
	'br'
]);

/** @param {string} href */
const safeHref = (href) => (/^(https?:|mailto:|tel:|\/|#)/i.test(href.trim()) ? href.trim() : null);

/**
 * Editor.js text is HTML. Keep the inline tags above, drop their attributes (except a link's
 * destination) and show anything else as text.
 * @param {unknown} html
 */
export function inline(html) {
	if (typeof html !== 'string') return '';
	return html.replace(/<(\/?)([a-z][a-z0-9]*)\b([^>]*)>|</gi, (m, close, name, attrs) => {
		if (!name) return '&lt;';
		const tag = name.toLowerCase();
		if (!INLINE.has(tag)) return esc(m);
		if (close) return tag === 'br' ? '' : `</${tag}>`;
		if (tag !== 'a') return tag === 'code' ? '<code>' : `<${tag}>`;
		const href = /href\s*=\s*(?:"([^"]*)"|'([^']*)')/i.exec(attrs);
		const safe = href && safeHref(href[1] ?? href[2]);
		if (!safe) return '<a>';
		const external =
			/^https?:/i.test(safe) && !/^https?:\/\/(www\.)?alexwang\.net(\/|$)/i.test(safe);
		return `<a href="${esc(safe.replace(/&amp;/g, '&'))}"${external ? ' rel="noopener" target="_blank"' : ''}>`;
	});
}

/** @param {string} text */
// plain text from editor HTML, with entities turned back into characters ("&amp;" into "&")
const plain = (text) => decodeEntities(text.replace(/<[^>]*>/g, '')).trim();

/** @param {string} text */
export const slugify = (text) =>
	plain(text)
		.toLowerCase()
		.normalize('NFKD')
		.replace(/[^\p{L}\p{N}]+/gu, '-')
		.replace(/^-+|-+$/g, '');

/**
 * @param {any[]} items nested list items
 * @param {'ol' | 'ul'} tag
 * @returns {string}
 */
function list(items, tag) {
	if (!items?.length) return '';
	const lis = items
		.map((item) => {
			// nested items are objects; the older flat list block used plain strings
			const text = typeof item === 'string' ? item : item.content;
			return `<li>${inline(text)}${list(item?.items, tag)}</li>`;
		})
		.join('');
	return `<${tag}>${lis}</${tag}>`;
}

/** @param {any} data */
function image(data) {
	const url = data?.file?.url ?? data?.url;
	if (!url) return '';
	const caption = data.caption ? `<figcaption>${inline(data.caption)}</figcaption>` : '';
	const alt = esc(plain(data.caption ?? ''));
	const classes = [
		'post-figure',
		data.stretched && 'stretched',
		data.withBorder && 'bordered',
		data.withBackground && 'backed'
	]
		.filter(Boolean)
		.join(' ');

	// Photos from the CMS are served resized and as webp, and carry their size so the page does not
	// jump as they load. Other sources are used as they are.
	const MAX = 1600;
	const cms = /^https:\/\/cms\.alexwang\.net\/assets\/[\w-]+$/.test(url);
	const w = Number(data?.file?.width);
	const h = Number(data?.file?.height);
	const sized = w > 0 && h > 0;
	const shown = sized ? Math.min(w, MAX) : 0;
	const src = cms ? `${url}?format=webp&width=${shown || MAX}` : url;
	const dims = sized ? ` width="${shown}" height="${Math.round((h * shown) / w)}"` : '';
	return `<figure class="${classes}"><img src="${esc(src)}" alt="${alt}"${dims} loading="lazy" decoding="async">${caption}</figure>`;
}

/**
 * @param {any} table
 */
function tableOf(table) {
	const rows = /** @type {string[][]} */ (table?.content ?? []);
	if (!rows.length) return '';
	const headed = !!table.withHeadings;
	const labels = headed ? rows[0].map((c) => esc(plain(c ?? ''))) : [];

	/** @param {string[]} row @param {boolean} total */
	const bodyRow = (row, total) =>
		`<tr${total ? ' class="total"' : ''}>${row
			.map((c, i) => {
				const text = inline(c ?? '');
				// with a heading row, the first column names the row and is its header cell
				if (headed && i === 0) return `<th scope="row">${text}</th>`;
				return `<td${labels[i] ? ` data-label="${labels[i]}"` : ''}>${text}</td>`;
			})
			.join('')}</tr>`;

	const head = headed
		? `<thead><tr>${rows[0].map((c) => `<th scope="col">${inline(c ?? '')}</th>`).join('')}</tr></thead>`
		: '';
	const data = headed ? rows.slice(1) : rows;
	const body = data
		.map((r, i) => bodyRow(r, i === data.length - 1 && /total/i.test(plain(r[0] ?? ''))))
		.join('');
	return `<div class="table-scroll"><table>${head}<tbody>${body}</tbody></table></div>`;
}

/**
 * Whether a character code is whitespace, exactly as `\s` in a regular expression means it.
 * @param {number} c
 */
const isSpace = (c) =>
	c === 32 ||
	(c >= 9 && c <= 13) ||
	(c > 127 &&
		(c === 0xa0 ||
			c === 0x1680 ||
			(c >= 0x2000 && c <= 0x200a) ||
			c === 0x2028 ||
			c === 0x2029 ||
			c === 0x202f ||
			c === 0x205f ||
			c === 0x3000 ||
			c === 0xfeff));

/**
 * How many runs of non-whitespace a text holds; the same count as splitting on `\s+`, without
 * building an array of every word (this runs over whole posts for reading times).
 * @param {string} text
 */
const wordsIn = (text) => {
	let n = 0;
	let inWord = false;
	for (let i = 0; i < text.length; i++) {
		const space = isSpace(text.charCodeAt(i));
		if (!space && !inWord) n++;
		inWord = !space;
	}
	return n;
};

/**
 * An Editor.js document from the CMS, which sends it as an object or as its JSON text.
 * @param {any} content
 * @returns {{ type: string, data: any }[]}
 */
function blocksOf(content) {
	let doc = content;
	if (typeof doc === 'string') {
		try {
			doc = JSON.parse(doc);
		} catch {
			return [];
		}
	}
	return doc?.blocks ?? [];
}

/**
 * The words a reader reads in a block: paragraphs, lists and quotes (headings are not counted).
 * @param {{ type: string, data: any }} block
 */
function blockWords({ type, data }) {
	switch (type) {
		case 'paragraph':
		case 'quote':
			return wordsIn(plain(data?.text ?? ''));
		case 'list':
		case 'nestedlist':
			// counted over the items' JSON, as the reading times always have been
			return wordsIn(plain(JSON.stringify(data?.items ?? [])));
		default:
			return 0;
	}
}

/**
 * One block as HTML. Headings get an id unique in `state.used`, and second-level ones are counted
 * and reported to `onSection` with that id and their text.
 * @param {{ type: string, data: any }} block
 * @param {{ used: Set<string>, sections: number }} state
 * @param {(id: string, text: string) => void} [onSection]
 */
function blockHtml({ type, data }, state, onSection) {
	switch (type) {
		case 'paragraph':
			// the editor leaves blank paragraphs (nbsp, br) between blocks; they are spacing, not content
			return plain(data.text ?? '')
				.replace(/\u00a0/g, '')
				.trim()
				? `<p>${inline(data.text)}</p>`
				: '';
		case 'header': {
			const level = Math.min(6, Math.max(2, Number(data.level) || 2));
			const label = plain(data.text ?? '');
			if (!label) return '';
			let id = slugify(label) || `section-${state.sections + 1}`;
			while (state.used.has(id)) id += '-2';
			state.used.add(id);
			if (level === 2) {
				state.sections++;
				onSection?.(id, label);
			}
			return `<h${level} id="${id}">${inline(data.text)}</h${level}>`;
		}
		case 'list':
		case 'nestedlist':
			return list(data.items, data.style === 'ordered' ? 'ol' : 'ul');
		case 'checklist':
			return `<ul class="checklist">${(data.items ?? [])
				.map(
					(/** @type {any} */ i) =>
						`<li><input type="checkbox" disabled${i.checked ? ' checked' : ''} aria-label="${i.checked ? 'Done' : 'Not done'}"> ${inline(i.text)}</li>`
				)
				.join('')}</ul>`;
		case 'quote':
			return `<blockquote><p>${inline(data.text)}</p>${data.caption ? `<cite>${inline(data.caption)}</cite>` : ''}</blockquote>`;
		case 'code':
			return `<pre><code>${esc(data.code ?? '')}</code></pre>`;
		case 'image':
			return image(data);
		case 'delimiter':
			return '<hr>';
		case 'table':
			return tableOf(data);
		case 'raw':
			return data.html ?? '';
		default:
			return '';
	}
}

/**
 * @param {any} content an Editor.js document ({ blocks }) or its JSON text
 * @param {{ count?: boolean }} [options] `count: false` skips counting words (and `words` is 0,
 *   every heading's `before` too), for callers that only want the HTML, like the feed
 * @returns {{ html: string, headings: { id: string, text: string, before: number }[], words: number }}
 */
export function render(content, { count = true } = {}) {
	/** @type {{ id: string, text: string, before: number }[]} */
	const headings = [];
	const state = { used: new Set(), sections: 0 };
	let words = 0;
	const html = blocksOf(content)
		.map((block) => {
			const out = blockHtml(block, state, (id, text) => headings.push({ id, text, before: words }));
			if (count) words += blockWords(block);
			return out;
		})
		.join('\n');
	return { html, headings, words };
}

/**
 * What a post card needs from a body, without rendering all of it: its word count, and the HTML of
 * its opening blocks, enough to hold `chars` characters of text (none when `chars` is 0).
 * @param {any} content an Editor.js document ({ blocks }) or its JSON text
 * @param {number} chars
 */
export function summarize(content, chars) {
	const blocks = blocksOf(content);
	const state = { used: new Set(), sections: 0 };
	const lead = [];
	let words = 0;
	let length = 0;
	for (const block of blocks) {
		words += blockWords(block);
		if (chars > 0 && length <= chars) {
			const html = blockHtml(block, state);
			lead.push(html);
			length += html.replace(/<[^>]*>/g, '').length;
		}
	}
	return { lead: lead.join('\n'), words };
}
