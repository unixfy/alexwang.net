// Whether dark mode is enabled. Persists to localStorage and sets the `dark` class and the daisyUI
// `data-theme` (line / line-night) on <html>.
// Defaults to dark when the user hasn't chosen yet.

import { writable } from 'svelte/store';
import { browser } from '$app/env';

function createDarkmode() {
	const store = writable(true);
	if (!browser) return store;

	let initial = true;
	try {
		const saved = localStorage.getItem('darkmode');
		initial = saved !== 'false';
	} catch {
		// localStorage unavailable; fall back to dark
	}
	store.set(initial);

	store.subscribe((value) => {
		document.documentElement.classList.toggle('dark', value);
		document.documentElement.dataset.theme = value ? 'line-night' : 'line';
		try {
			localStorage.setItem('darkmode', String(value));
		} catch {
			// ignore
		}
	});

	return store;
}

export const darkmode = createDarkmode();
