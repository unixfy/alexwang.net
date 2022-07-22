import { sveltekit } from '@sveltejs/kit/vite';
import path from 'path';


/** @type {import('vite').UserConfig} */
const config = {
    plugins: [sveltekit()],
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