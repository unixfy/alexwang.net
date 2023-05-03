import {sveltekit} from '@sveltejs/kit/vite';
import {SvelteKitPWA} from '@vite-pwa/sveltekit';
import path from 'path';


/** @type {import('vite').UserConfig} */
const config = {
    plugins: [sveltekit(), SvelteKitPWA({
        workbox: {
            globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        },
        registerType: "prompt",
        strategies: "generateSW",
        scope: '/',
        start_url: '/',
        manifest: {
            "background_color": "#ffffff",
            "theme_color": "#7E1F86",
            "name": "alexwang.net",
            "short_name": "alexwang.net",
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
    legacy: {buildSsrCjsExternalHeuristics: true},
    ssr: {
        // We have to add this workaround because of #4504 https://github.com/sveltejs/kit/issues/4504
        // In the future DayJS 2.0 will not require this workaround
        noExternal: ['dayjs']
    }
};

export default config;