import { defineConfig, devices } from '@playwright/test';
import base from './playwright.config';

// Screenshots only match inside the Playwright Docker image, which pins fonts and text
// rendering. On a Mac, a run would also write -darwin baselines next to the real ones.
if (process.platform !== 'linux') {
	throw new Error('Run the visual tests with `pnpm test:e2e:visual`, in the Playwright image.');
}

// The footer shows the latest commit's date and SHA, which would change every screenshot on every
// commit. vite.config.ts reads these, and the web server inherits them.
process.env.PUBLIC_GIT_SHA = '0'.repeat(40);
process.env.PUBLIC_GIT_DATE = '2026-01-01T12:00:00Z';

export default defineConfig({
	...base,
	testMatch: '**/visual.spec.ts',
	testIgnore: [],
	// The default per-pixel threshold (0.2) lets a one-shade color change pass. Even in the
	// pinned image, Chromium shades dotted underlines differently on some launches (gray 128 vs
	// 123); those pairs match from 0.023. 0.03 absorbs that and still fails a one-step token change.
	expect: { toHaveScreenshot: { threshold: 0.03 } },
	reporter: [[process.env.CI ? 'github' : 'list'], ['html', { open: 'never' }]],
	projects: [
		{ name: 'desktop-chromium', use: { ...devices['Desktop Chrome'] } },
		{ name: 'mobile-webkit', use: { ...devices['iPhone 15'] } }
	]
});
