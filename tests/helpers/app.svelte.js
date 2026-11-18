// Stand-ins for SvelteKit's $app modules in component tests. `page` is reactive, like the real one,
// so a test can change the URL or a form answer and see the component follow.
import { vi } from 'vitest';

export const page = $state({
	url: new URL('https://alexwang.net/'),
	params: /** @type {Record<string, string>} */ ({}),
	data: /** @type {Record<string, any>} */ ({}),
	form: /** @type {any} */ (null),
	status: 200,
	error: /** @type {any} */ (null)
});

/** Put the page back to a plain 200 at `path`. */
export function resetPage(path = '/') {
	page.url = new URL(`https://alexwang.net${path}`);
	page.params = {};
	page.data = {};
	page.form = null;
	page.status = 200;
	page.error = null;
}

export const goto = vi.fn(async () => {});

/** @type {((nav: any) => any)[]} */
export const navigateHooks = [];
export const onNavigate = vi.fn((/** @type {(nav: any) => any} */ fn) => {
	navigateHooks.push(fn);
});

/** Forms enhanced with `use:enhance`, and the submit function each was given. */
export const enhanced = /** @type {{ form: HTMLFormElement, submit: any }[]} */ ([]);
export const enhance = (/** @type {HTMLFormElement} */ form, /** @type {any} */ submit) => {
	enhanced.push({ form, submit });
	return {
		destroy: () =>
			enhanced.splice(
				enhanced.findIndex((e) => e.form === form),
				1
			)
	};
};
