import { readdirSync } from 'node:fs';
import { basename, dirname } from 'node:path';
import { expect, test } from '@playwright/test';
import { getPagePaths } from './helpers';

const colorSchemes = ['light', 'dark'] as const;

const screenshotName = (path: string, colorScheme: string) =>
	`${path === '/' ? 'home' : path.slice(1).replaceAll('/', '-')}-${colorScheme}.png`;

for (const colorScheme of colorSchemes) {
	test.describe(`${colorScheme} mode`, () => {
		test.use({ colorScheme });

		test('every page matches its screenshot', async ({ page, request }) => {
			const paths = await getPagePaths(request);
			test.setTimeout(15_000 + paths.length * 10_000);
			for (const path of paths) {
				await test.step(path, async () => {
					await page.goto(path);
					await expect
						.soft(page)
						.toHaveScreenshot(screenshotName(path, colorScheme), { fullPage: true });
				});
			}
		});
	});
}

// Playwright never deletes a baseline, so one left by a removed or renamed page would stay
// committed unnoticed.
test('every screenshot belongs to a page', async ({ request }, testInfo) => {
	const screenshotPath = (name: string) => testInfo.snapshotPath(name, { kind: 'screenshot' });
	const expected = (await getPagePaths(request)).flatMap((path) =>
		colorSchemes.map((colorScheme) => basename(screenshotPath(screenshotName(path, colorScheme))))
	);
	// The projects share the folder. Each file name ends in its project and platform.
	const suffix = basename(screenshotPath('x.png')).slice(1);
	const committed = readdirSync(dirname(screenshotPath('x.png'))).filter((file) =>
		file.endsWith(suffix)
	);
	expect(committed.filter((file) => !expected.includes(file))).toEqual([]);
});
