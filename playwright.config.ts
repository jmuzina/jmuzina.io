import { defineConfig, devices } from '@playwright/test';
import { e2ePort } from './src/lib/e2e-port.ts';

// The config's directory, not the cwd, so the port doesn't depend on where Playwright starts.
const port = e2ePort(import.meta.dirname);

// Runs against the built site: csr is off, so behavior lives in inline scripts, and only the
// built site runs them on the prerendered HTML a visitor gets.
export default defineConfig({
	testDir: 'e2e',
	// Screenshots only match inside the Playwright Docker image (see playwright.visual.config.ts).
	testIgnore: '**/visual.spec.ts',
	fullyParallel: true,
	forbidOnly: !!process.env.CI,
	// The retry only tells a flaky test from a consistent failure in the report. Both fail the run.
	retries: process.env.CI ? 1 : 0,
	failOnFlakyTests: !!process.env.CI,
	// Locally, suites from parallel worktrees share the CPU, and Playwright's default (half the
	// cores each) makes them starve each other into timeouts. Two keeps a timeout a real failure.
	workers: process.env.CI ? undefined : 2,
	reporter: process.env.CI ? 'github' : 'list',
	use: {
		baseURL: `http://localhost:${port}`,
		trace: 'retain-on-failure'
	},
	webServer: {
		command: `pnpm run build && pnpm run preview --port ${port} --strictPort`,
		url: `http://localhost:${port}`,
		// A server already on the port may be stale or another checkout's, so fail instead of
		// testing it.
		reuseExistingServer: false,
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
