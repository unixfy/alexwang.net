import { createDirectus, rest } from '@directus/sdk';

/** @param {typeof globalThis.fetch} [fetch] */
function getDirectusInstance(fetch) {
	const options = fetch ? { globals: { fetch } } : {};
	const directus = createDirectus('https://cms.alexwang.net', options).with(rest());
	return directus;
}

export default getDirectusInstance;
