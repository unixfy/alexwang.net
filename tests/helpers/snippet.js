import { createRawSnippet } from 'svelte';

/** A children snippet rendering some HTML, for components that take one. */
export const html = (/** @type {string} */ markup) =>
	createRawSnippet(() => ({ render: () => `<div>${markup}</div>` }));
