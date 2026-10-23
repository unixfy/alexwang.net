/**
 * Format a CMS date in UTC (Directus stores dates without a zone).
 * @param {string | number | Date} value
 * @param {Intl.DateTimeFormatOptions} options
 */
function formatDate(value, options) {
	return new Intl.DateTimeFormat('en-US', { timeZone: 'UTC', ...options }).format(new Date(value));
}

/** @param {string} d */
export const year = (d) => formatDate(d, { year: 'numeric' });

/** @param {string} d */
export const monthYear = (d) => formatDate(d, { month: 'long', year: 'numeric' });

/** @param {string} d */
export const fullDate = (d) => formatDate(d, { month: 'long', day: '2-digit', year: 'numeric' });
