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
	// The default per-pixel threshold (0.2) lets a one-shade color change pass. The image pins
	// rendering, so there's no noise to tolerate, except in Chromium (below).
	expect: { toHaveScreenshot: { threshold: 0 } },
	reporter: [[process.env.CI ? 'github' : 'list'], ['html', { open: 'never' }]],
	projects: [
		{
			name: 'desktop-chromium',
			use: { ...devices['Desktop Chrome'] },
			// Chromium shades dotted underlines differently on some launches (gray 128 vs 123);
			// those pairs match from 0.023. Of the one-step shade changes in the theme and Tailwind's
			// palettes, 0.03 lets through only stone, slate, gray and olive 50 to 100 and success
			// 300 to 400, none of which the site uses.
			expect: { toHaveScreenshot: { threshold: 0.03 } }
		},
		{ name: 'mobile-webkit', use: { ...devices['iPhone 15'] } }
	]
});
