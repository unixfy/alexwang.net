import { sveltekit } from '@sveltejs/kit/vite';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';


/** @type {import('vite').UserConfig} */
const config = {
    plugins: [sveltekit(), VitePWA({
        workbox: {
            globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        },
        registerType: "prompt",
        strategies: "injectManifest",
        srcDir: './build',
        outDir: './.svelte-kit/output/client',
        manifest: {
            "background_color": "#ffffff",
            "theme_color": "#7E1F86",
            "name": "alex-wang.net",
            "short_name": "alex-wang.net",
            "start_url": "/",
            "display": "standalone",
            "icons": [
                {
                    "src": "/favicon.png",
                    "sizes": "512x512",
                    "type": "image/png",
                    "purpose": "maskable any"
                }
            ]
        }
    })],
    resolve: {
        alias: {
            '$components': path.resolve('./src/components')
        }
    },
    legacy: { buildSsrCjsExternalHeuristics: true },
    ssr: {
        // We have to add this workaround because of #4504 https://github.com/sveltejs/kit/issues/4504
        // In the future DayJS 2.0 will not require this workaround
        noExternal: ['dayjs']
    }
};

export default config;