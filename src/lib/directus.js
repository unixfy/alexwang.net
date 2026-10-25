import { createDirectus, rest } from '@directus/sdk';

/** @param {typeof globalThis.fetch} [fetch] */
function getDirectusInstance(fetch) {
	const options = fetch ? { globals: { fetch } } : {};
	const directus = createDirectus('https://cms.alexwang.net', options).with(rest());
	return directus;
}

/**
 * A readable line for a failed Directus call. The SDK's error carries the Response, and logging that
 * object throws (its body has already been read), which would turn a missing section into a 500.
 * @param {unknown} err
 */
export function describe(err) {
	if (err && typeof err === 'object' && 'errors' in err && Array.isArray(err.errors)) {
		return err.errors.map((/** @type {{ message?: string }} */ e) => e?.message ?? e).join('; ');
	}
	return err instanceof Error ? err.message : String(err);
}

export default getDirectusInstance;
