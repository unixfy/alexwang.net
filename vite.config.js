import adapter from '@sveltejs/adapter-cloudflare';
import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';

/** @type {import('vite').UserConfig} */
const config = {
	plugins: [
		sveltekit({
			extensions: ['.svelte'],
			adapter: adapter(),
			serviceWorker: { register: true }
		}),
		tailwindcss()
	],
	server: {
		allowedHosts: true
	}
};

export default config;
