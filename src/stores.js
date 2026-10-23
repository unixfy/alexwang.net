// Whether dark mode is enabled. Persists to localStorage and toggles the `dark` class on <html>.
// Defaults to the system color scheme when the user hasn't chosen yet.

import { writable } from 'svelte/store';
import { browser } from '$app/env';

function createDarkmode() {
	const store = writable(false);
	if (!browser) return store;

	let initial = false;
	try {
		const saved = localStorage.getItem('darkmode');
		initial =
			saved === null ? matchMedia('(prefers-color-scheme: dark)').matches : saved === 'true';
	} catch {
		// localStorage unavailable; fall back to light
	}
	store.set(initial);

	store.subscribe((value) => {
		document.documentElement.classList.toggle('dark', value);
		try {
			localStorage.setItem('darkmode', String(value));
		} catch {
			// ignore
		}
	});

	return store;
}

export const darkmode = createDarkmode();
