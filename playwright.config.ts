import { defineConfig, devices } from '@playwright/test';

// E2E_PORT lets worktrees run e2e side by side; on a shared port one would reuse the other's server
// and test the wrong build.
const port = Number(process.env.E2E_PORT || 4173);
if (!Number.isInteger(port) || port < 1 || port > 65535) {
	throw new Error(`E2E_PORT must be a port number, got "${process.env.E2E_PORT}".`);
}

// Runs against the built site: csr is off, so behavior lives in inline scripts that component
// tests can't execute.
export default defineConfig({
	testDir: 'e2e',
	// Screenshots only match inside the Playwright Docker image (see playwright.visual.config.ts).
	testIgnore: '**/visual.spec.ts',
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
