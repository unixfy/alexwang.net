import { decodeHTML } from 'entities';

/**
 * The first words of an HTML field as plain text, cut at a word boundary.
 * @param {string | null | undefined} html
 * @param {number} [max] characters
 */
export function excerpt(html, max = 160) {
	if (!html) return '';
	const text = decodeHTML(
		html
			.replace(/<(script|style)[\s\S]*?<\/\1>/gi, '')
			.replace(/<\/(p|div|li|h[1-6]|br)>|<br\s*\/?>/gi, ' ')
			.replace(/<[^>]*>/g, '')
	)
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
