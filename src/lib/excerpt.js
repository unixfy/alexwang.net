import { decodeEntities } from '#lib/entities.js';

/**
 * The first words of an HTML field as plain text, cut at a word boundary.
 * @param {string | null | undefined} html
 * @param {number} [max] characters
 */
export function excerpt(html, max = 160) {
	if (!html) return '';
	const text = html
		.replace(/<(script|style)[\s\S]*?<\/\1>/gi, '')
		.replace(/<\/(p|div|li|h[1-6]|br)>|<br\s*\/?>/gi, ' ')
		.replace(/<[^>]*>/g, '')
		.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (m) => decodeEntities(m))
		.replace(/\s+/g, ' ')
		.trim();
	if (text.length <= max) return text;
	return (
		text
			.slice(0, max)
			.replace(/\s+\S*$/, '')
			.replace(/[\s,.;:–—-]+$/, '') + '…'
	);
}
