/**
 * The host of a link without a leading "www.", for showing where a button goes.
 * @param {string | null | undefined} href
 * @returns {string | null} null when it is not a usable URL
 */
export function domain(href) {
	if (!href) return null;
	try {
		return new URL(href).hostname.replace(/^www\./, '') || null;
	} catch {
		return null;
	}
}
