const ENTITIES = /** @type {Record<string, string>} */ ({
	amp: '&',
	lt: '<',
	gt: '>',
	quot: '"',
	apos: "'",
	nbsp: ' ',
	rsquo: '’',
	lsquo: '‘',
	rdquo: '”',
	ldquo: '“',
	ndash: '–',
	mdash: '—',
	hellip: '…'
});

/**
 * HTML entities in text to the characters they stand for ("&amp;" becomes "&"), for text that came
 * from HTML but is shown as plain text, where Svelte would escape the ampersand again.
 * @param {string} text
 */
export function decodeEntities(text) {
	return text.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (m, code) => {
		if (code[0] === '#') {
			const n = code[1].toLowerCase() === 'x' ? parseInt(code.slice(2), 16) : +code.slice(1);
			return Number.isFinite(n) ? String.fromCodePoint(n) : m;
		}
		return ENTITIES[code.toLowerCase()] ?? m;
	});
}
