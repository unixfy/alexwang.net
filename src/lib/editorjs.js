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
const plain = (text) =>
	text
		.replace(/<[^>]*>/g, '')
		.replace(/&nbsp;/g, ' ')
		.trim();

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
	return `<figure class="${classes}"><img src="${esc(url)}" alt="${alt}" loading="lazy" decoding="async">${caption}</figure>`;
}

/**
 * @param {any} table
 */
function tableOf(table) {
	const rows = table?.content ?? [];
	if (!rows.length) return '';
	const cells = (/** @type {string[]} */ row, /** @type {'td' | 'th'} */ cell) =>
		`<tr>${row.map((c) => `<${cell}>${inline(c)}</${cell}>`).join('')}</tr>`;
	const head = table.withHeadings ? `<thead>${cells(rows[0], 'th')}</thead>` : '';
	const body = (table.withHeadings ? rows.slice(1) : rows)
		.map((/** @type {string[]} */ r) => cells(r, 'td'))
		.join('');
	return `<div class="table-scroll"><table>${head}<tbody>${body}</tbody></table></div>`;
}

/**
 * @param {any} content an Editor.js document ({ blocks }) or its JSON text
 * @returns {{ html: string, headings: { id: string, text: string }[], words: number }}
 */
export function render(content) {
	let doc = content;
	if (typeof doc === 'string') {
		try {
			doc = JSON.parse(doc);
		} catch {
			return { html: '', headings: [], words: 0 };
		}
	}
	const blocks = /** @type {{ type: string, data: any }[]} */ (doc?.blocks ?? []);
	/** @type {{ id: string, text: string }[]} */
	const headings = [];
	const used = new Set();
	let text = '';

	const html = blocks
		.map(({ type, data }) => {
			switch (type) {
				case 'paragraph':
					text += ` ${plain(data.text ?? '')}`;
					return data.text?.trim() ? `<p>${inline(data.text)}</p>` : '';
				case 'header': {
					const level = Math.min(6, Math.max(2, Number(data.level) || 2));
					const label = plain(data.text ?? '');
					if (!label) return '';
					let id = slugify(label) || `section-${headings.length + 1}`;
					while (used.has(id)) id += '-2';
					used.add(id);
					if (level === 2) headings.push({ id, text: label });
					return `<h${level} id="${id}">${inline(data.text)}</h${level}>`;
				}
				case 'list':
				case 'nestedlist':
					text += ` ${plain(JSON.stringify(data.items ?? []))}`;
					return list(data.items, data.style === 'ordered' ? 'ol' : 'ul');
				case 'checklist':
					return `<ul class="checklist">${(data.items ?? [])
						.map(
							(/** @type {any} */ i) =>
								`<li><input type="checkbox" disabled${i.checked ? ' checked' : ''} aria-label="${i.checked ? 'Done' : 'Not done'}"> ${inline(i.text)}</li>`
						)
						.join('')}</ul>`;
				case 'quote':
					text += ` ${plain(data.text ?? '')}`;
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
		})
		.join('\n');

	return { html, headings, words: text.split(/\s+/).filter(Boolean).length };
}
