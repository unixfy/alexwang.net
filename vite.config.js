import adapter from '@sveltejs/adapter-cloudflare';
import { sveltekit } from '@sveltejs/kit/vite';
import { SvelteKitPWA } from '@vite-pwa/sveltekit';
import tailwindcss from '@tailwindcss/vite';

/** @type {import('vite').UserConfig} */
const config = {
	plugins: [
		sveltekit({
			extensions: ['.svelte'],
			adapter: adapter(),
			serviceWorker: {
				register: false
			}
		}),
		tailwindcss(),
		SvelteKitPWA({
			workbox: {
				globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
				maximumFileSizeToCacheInBytes: 5000000
			},
			registerType: 'prompt',
			strategies: 'generateSW',
			scope: '/',
			manifest: {
				background_color: '#ffffff',
				theme_color: '#7E1F86',
				name: 'alexwang.net',
				short_name: 'alexwang.net',
				start_url: '/',
				display: 'standalone',
				icons: [
					{ src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
					{ src: '/favicon.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
					{
						src: '/icon-maskable-512.png',
						sizes: '512x512',
						type: 'image/png',
						purpose: 'maskable'
					}
				]
			}
		})
	],
	server: {
		allowedHosts: true
	}
};

export default config;
