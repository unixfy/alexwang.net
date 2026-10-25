/**
 * Format a CMS date in UTC (Directus stores dates without a zone).
 * @param {string | number | Date | null | undefined} value
 * @param {Intl.DateTimeFormatOptions} options
 */
function formatDate(value, options) {
	if (!value) return '';
	return new Intl.DateTimeFormat('en-US', { timeZone: 'UTC', ...options }).format(new Date(value));
}

/** @param {string} d */
export const year = (d) => formatDate(d, { year: 'numeric' });

/** @param {string} d */
export const monthYear = (d) => formatDate(d, { month: '2-digit', year: 'numeric' });

/** @param {string} d */
export const fullDate = (d) => formatDate(d, { month: 'long', day: '2-digit', year: 'numeric' });

/**
 * A span like "06/2021 – Present"; a missing end date means it is ongoing. With no start date there
 * is no span to show, so only the end (or nothing) is.
 * @param {string | null | undefined} start
 * @param {string | null | undefined} end
 */
export function dateSpan(start, end) {
	if (!start) return end ? monthYear(end) : '';
	return `${monthYear(start)} – ${end ? monthYear(end) : 'Present'}`;
}

/**
 * Order for things with a start and an end: still running first, then the latest end date, then the
 * latest start. CMS dates are ISO strings, so comparing them as text is comparing them as dates.
 * @param {Record<string, any>} a with `start_date` and `end_date`
 * @param {Record<string, any>} b
 */
export function byRecency(a, b) {
	if (!a.end_date !== !b.end_date) return a.end_date ? 1 : -1;
	return (
		(b.end_date ?? '').localeCompare(a.end_date ?? '') ||
		(b.start_date ?? '').localeCompare(a.start_date ?? '')
	);
}
