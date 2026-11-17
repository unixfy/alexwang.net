import { sveltekit } from '@sveltejs/kit/vite';
import { svelteTesting } from '@testing-library/svelte/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [sveltekit({ extensions: ['.svelte'] })],
	test: {
		restoreMocks: true,
		unstubEnvs: true,
		unstubGlobals: true,
		projects: [
			{
				extends: true,
				test: {
					name: 'server',
					environment: 'node',
					include: ['tests/unit/server/**/*.test.js', 'tests/integration/**/*.test.js']
				}
			},
			{
				extends: true,
				plugins: [svelteTesting()],
				test: {
					name: 'dom',
					environment: 'jsdom',
					include: ['tests/unit/dom/**/*.test.js', 'tests/component/**/*.test.js'],
					setupFiles: ['tests/setup/dom.js']
				}
			}
		],
		coverage: {
			provider: 'v8',
			include: ['src/**/*.{js,svelte}'],
			reporter: ['text', 'html', 'json-summary', 'lcov'],
			thresholds: { lines: 99, statements: 99, functions: 99, branches: 95 }
		}
	}
});
