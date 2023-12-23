import { mdsvex } from 'mdsvex';
import mdsvexConfig from './mdsvex.config.js';
import azure from 'svelte-adapter-azure-swa';
import preprocess from 'svelte-preprocess';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	extensions: ['.svelte', ...mdsvexConfig.extensions],

	// Consult https://github.com/sveltejs/svelte-preprocess
	// for more information about preprocessors
	preprocess: [
		preprocess({
			postcss: true
		}),
		mdsvex(mdsvexConfig)
	],

	kit: {
		adapter: azure(),
		serviceWorker: {
			register: false
		}
	},

	serviceWorker: {
		register: false
	}
};

export default config;
