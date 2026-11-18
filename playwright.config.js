import { defineConfig, devices } from '@playwright/test';

// System tests: the production build in a real browser, against the fake CMS (tests/system/serve.js).
// Run `npm run build` first.
export default defineConfig({
	testDir: 'tests/system',
	testMatch: '*.spec.js',
	fullyParallel: true,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 1 : 0,
	reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
	use: {
		baseURL: 'http://localhost:4173',
		trace: 'retain-on-failure',
		// the WebGL map and tower are drawn in software in a headless browser; under reduced motion they
		// draw one still frame instead of animating, which keeps parallel runs fast and deterministic
		// (their animation is covered by the unit tests)
		contextOptions: { reducedMotion: 'reduce' }
	},
	projects: [
		{
			name: 'desktop',
			use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } }
		},
		{ name: 'phone', use: { ...devices['Pixel 7'] } }
	],
	webServer: {
		command: 'node tests/system/serve.js',
		url: 'http://localhost:4173/robots.txt',
		reuseExistingServer: !process.env.CI,
		stdout: 'pipe'
	}
});
