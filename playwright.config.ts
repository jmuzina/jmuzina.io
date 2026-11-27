import { defineConfig, devices } from '@playwright/test';

const port = 4173;

// Runs against the built site: csr is off, so behavior lives in inline scripts that component
// tests can't execute.
export default defineConfig({
	testDir: 'e2e',
	fullyParallel: true,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 1 : 0,
	reporter: process.env.CI ? 'github' : 'list',
	use: {
		baseURL: `http://localhost:${port}`,
		trace: 'retain-on-failure'
	},
	webServer: {
		command: `pnpm run build && pnpm run preview --port ${port} --strictPort`,
		url: `http://localhost:${port}`,
		reuseExistingServer: !process.env.CI,
		timeout: 120_000
	},
	projects: [
		{ name: 'desktop-chromium', use: { ...devices['Desktop Chrome'] }, grepInvert: /@no-js/ },
		{ name: 'desktop-firefox', use: { ...devices['Desktop Firefox'] }, grepInvert: /@no-js/ },
		{ name: 'desktop-webkit', use: { ...devices['Desktop Safari'] }, grepInvert: /@no-js/ },
		// Playwright can't emulate mobile Firefox, so phones are covered by Chromium and WebKit.
		{ name: 'mobile-chromium', use: { ...devices['Pixel 7'] }, grepInvert: /@no-js/ },
		{ name: 'mobile-webkit', use: { ...devices['iPhone 15'] }, grepInvert: /@no-js/ },
		{
			name: 'no-js',
			use: { ...devices['Pixel 7'], javaScriptEnabled: false },
			grep: /@no-js/
		}
	]
});
