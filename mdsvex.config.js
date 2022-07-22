import { defineMDSveXConfig as defineConfig } from 'mdsvex';

const config = defineConfig({
	extensions: ['.svelte.md', '.md', '.svx'],

	smartypants: {
		dashes: 'oldschool'
	},

	remarkPlugins: [],
	rehypePlugins: [],
	layout: {
		// this layout is for projects
		// remember that mdsvex still doesn't have support for the sveltekit default __layout so we have to do this
		project: "./src/routes/project/_layout.svelte"
	}
});

export default config;
