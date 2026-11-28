// axe catches a subset of WCAG failures; keyboard and screen reader checks still need a human.
import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { findStateContrastFailures } from './contrast';
import {
	AXE_TAGS,
	expectSiteFocusRing,
	getPagePaths,
	getSiteFocusRing,
	openNavIfCollapsed,
	tabKey,
	type FocusRing
} from './helpers';

const format = (violations: Awaited<ReturnType<AxeBuilder['analyze']>>['violations']) =>
	violations.map(
		(v) => `[${v.impact}] ${v.id}: ${v.help}\n${v.nodes.map((n) => `  - ${n.target}`).join('\n')}`
	);

for (const colorScheme of ['light', 'dark'] as const) {
	test.describe(`${colorScheme} mode`, () => {
		test.use({ colorScheme });

		test('every page has no axe violations', async ({ page, request }) => {
			for (const path of await getPagePaths(request)) {
				await test.step(path, async () => {
					await page.goto(path);
					const { violations } = await new AxeBuilder({ page }).withTags(AXE_TAGS).analyze();
					expect.soft(format(violations), path).toEqual([]);
				});
			}
		});

		// People open the feed from the blog, but axe skips almost everything in an XML document
		// and reports no violations. So this moves the feed's XHTML, with its stylesheet, into an
		// HTML page on the same origin.
		test('the feed has no axe violations', async ({ page }) => {
			await page.goto('/feed.xml');
			const body = await page.locator('body').evaluate((el) => el.outerHTML);
			await page.goto('/blog');
			await page.setContent(
				`<!doctype html><html lang="en"><head><link href="/feed.css" rel="stylesheet"></head>${body}</html>`
			);
			await expect(page.getByRole('heading', { level: 1 })).toHaveText('Blog feed');
			const { violations } = await new AxeBuilder({ page }).withTags(AXE_TAGS).analyze();
			expect(format(violations)).toEqual([]);
		});

		// axe can't run in the no-js project: it needs page scripts. Chromium can block them for
		// the load and lift the block for axe, so inline scripts never run and the DOM stays as
		// a reader without JavaScript gets it.
		test('every page without JavaScript has no axe violations', async ({
			page,
			context,
			request,
			browserName
		}) => {
			test.skip(browserName !== 'chromium', 'needs the Chrome DevTools Protocol');
			const cdp = await context.newCDPSession(page);
			for (const path of await getPagePaths(request)) {
				await test.step(path, async () => {
					await cdp.send('Emulation.setScriptExecutionDisabled', { value: true });
					await page.goto(path);
					await cdp.send('Emulation.setScriptExecutionDisabled', { value: false });
					await expect(page.locator('html')).not.toHaveClass(/\bjs\b/);
					const { violations } = await new AxeBuilder({ page }).withTags(AXE_TAGS).analyze();
					expect.soft(format(violations), path).toEqual([]);
				});
			}
		});

		test('links and controls keep their contrast when hovered, visited and focused', async ({
			page,
			context,
			request,
			browserName
		}) => {
			test.skip(browserName !== 'chromium', 'needs the Chrome DevTools Protocol');
			const paths = await getPagePaths(request);
			test.setTimeout(15_000 + paths.length * 10_000);
			const cdp = await context.newCDPSession(page);
			for (const path of paths) {
				await test.step(path, async () => {
					await page.goto(path);
					expect.soft(await findStateContrastFailures(page, cdp), path).toEqual([]);
				});
			}
		});

		test('the open mobile menu has no violations', async ({ page, isMobile }) => {
			test.skip(!isMobile, 'the menu only collapses on small screens');
			await page.goto('/');
			await openNavIfCollapsed(page);
			const { violations } = await new AxeBuilder({ page }).withTags(AXE_TAGS).analyze();
			expect(format(violations)).toEqual([]);
		});
	});
}

// Rings that deliberately differ from the site ring, and how. They stay solid and in its color.
const RING_EXCEPTIONS: { selector: string; ring: Partial<FocusRing> }[] = [
	// its own border sits just inside the ring, so the ring is set further out to stay distinct
	{ selector: 'a[href="#main-content"]', ring: { width: '2px', offset: '2px' } },
	// the same ring as the skip link, which opens over it
	{ selector: 'header a[href="/"]', ring: { width: '2px', offset: '2px' } },
	// fills the sticky contents bar top to bottom: an outside ring would cover the bar's borders
	// and be cut off at the top of the screen
	{ selector: '.toc-mobile summary', ring: { offset: '-2px' } }
];

test('Tab reaches everything on every page and shows the site focus ring on each', async ({
	page,
	request,
	browserName
}) => {
	for (const path of await getPagePaths(request)) {
		await test.step(path, async () => {
			await page.goto(path);
			const siteRing = await getSiteFocusRing(page);
			const expected = await page.evaluate(() =>
				[
					...document.querySelectorAll(
						'a[href], button, input:not([type="hidden"]), select, textarea, summary, [tabindex]:not([tabindex="-1"])'
					)
				]
					.filter((el) => el.checkVisibility() && !el.matches(':disabled'))
					.map((el) => {
						el.setAttribute('data-tabbable', '');
						return el.outerHTML.slice(0, 80);
					})
			);

			const problems: string[] = [];
			let leftPage = false;
			for (let presses = 0; presses <= expected.length + 20; presses++) {
				await page.keyboard.press(tabKey(browserName));
				const focus = await page.evaluate(
					async ({ siteRing, exceptions }) => {
						const el = document.activeElement;
						// back at the start: past the last stop, or wrapped round to the first
						if (!el || el === document.body || el.hasAttribute('data-tabbed')) return null;
						el.setAttribute('data-tabbed', '');
						const cs = getComputedStyle(el);
						const exception = exceptions.find(({ selector }) => el.matches(selector));
						const want = { style: 'solid', ...siteRing, ...exception?.ring };
						const got = {
							style: cs.outlineStyle,
							width: cs.outlineWidth,
							offset: cs.outlineOffset,
							color: cs.outlineColor
						};
						const ring = (Object.keys(want) as (keyof typeof want)[])
							.filter((key) => got[key] !== want[key])
							.map((key) => `${key} ${got[key]}, not ${want[key]}`);
						const inView = () => {
							const r = el.getBoundingClientRect();
							return r.width > 1 && r.height > 1 && r.bottom > 0 && r.top < innerHeight;
						};
						// WebKit scrolls a focused text field into view after the focus event, not with it
						const deadline = performance.now() + 500;
						while (!inView() && performance.now() < deadline) {
							await new Promise(requestAnimationFrame);
						}
						return { name: el.outerHTML.slice(0, 80), ring, inView: inView() };
					},
					{ siteRing, exceptions: RING_EXCEPTIONS }
				);
				if (!focus) {
					leftPage = true;
					break;
				}
				if (focus.ring.length) {
					problems.push(`not the site focus ring (${focus.ring.join('; ')}): ${focus.name}`);
				}
				if (!focus.inView) problems.push(`focused but not on screen: ${focus.name}`);
			}
			if (!leftPage) problems.push('Tab never got back to the start: focus is trapped');
			const missed = await page.evaluate(() =>
				[...document.querySelectorAll('[data-tabbable]:not([data-tabbed])')].map((el) =>
					el.outerHTML.slice(0, 80)
				)
			);
			for (const name of missed) problems.push(`never reached by Tab: ${name}`);
			expect.soft(problems, path).toEqual([]);
		});
	}
});

test('a keyboard-focused link shows the site focus ring, not the browser one', async ({
	page,
	browserName
}) => {
	await page.goto('/privacy');
	await openNavIfCollapsed(page);
	const ring = await getSiteFocusRing(page);

	const links = [
		page.getByRole('navigation', { name: 'Main' }).getByRole('link').first(),
		page.locator('main a[href="https://matomo.org"]'),
		page.locator('main a[href^="mailto:"]')
	];
	for (const link of links) {
		await test.step((await link.textContent())!.trim(), async () => {
			const isFocused = () => link.evaluate((el) => el === document.activeElement);
			for (let presses = 0; presses < 50 && !(await isFocused()); presses++) {
				await page.keyboard.press(tabKey(browserName));
			}
			await expect(link).toBeFocused();
			await expectSiteFocusRing(link, ring);
		});
	}
});

test('every page reflows at 320px wide with nothing pinned to the screen', async ({
	page,
	request,
	isMobile
}) => {
	test.skip(isMobile, 'page zoom is a desktop setting');
	// a 1280×1024 window at 400% zoom (WCAG 1.4.10)
	await page.setViewportSize({ width: 320, height: 256 });
	for (const path of await getPagePaths(request)) {
		await test.step(path, async () => {
			await page.goto(path);
			const overflow = await page.evaluate(
				() => document.documentElement.scrollWidth - document.documentElement.clientWidth
			);
			expect.soft(overflow, `${path} scrolls sideways`).toBeLessThanOrEqual(0);
			// sticky and fixed UI must be gated with `tall:`; the empty live region is a 1px box
			const pinned = await page.evaluate(() =>
				[...document.querySelectorAll('body *')]
					.filter((el) => {
						if (!/^(sticky|fixed)$/.test(getComputedStyle(el).position)) return false;
						const r = el.getBoundingClientRect();
						return r.width > 1 && r.height > 1;
					})
					.map((el) => el.outerHTML.slice(0, 80))
			);
			expect.soft(pinned, `${path} pins UI to a short screen`).toEqual([]);
		});
	}
});

test.describe('with reduced motion', () => {
	test.use({ reducedMotion: 'reduce' });

	test('nothing on any page animates', async ({ page, request }) => {
		for (const path of await getPagePaths(request)) {
			await test.step(path, async () => {
				await page.goto(path);
				const moving = await page.evaluate(() => {
					const longest = (durations: string) =>
						Math.max(...durations.split(',').map((d) => parseFloat(d)));
					const found: string[] = [];
					if (getComputedStyle(document.documentElement).scrollBehavior === 'smooth') {
						found.push('html: smooth scrolling');
					}
					// hidden elements too: they can be shown later, at another width or when opened
					for (const el of document.querySelectorAll('*')) {
						for (const pseudo of [null, '::before', '::after']) {
							const cs = getComputedStyle(el, pseudo);
							const name = `${el.outerHTML.slice(0, 80)}${pseudo ?? ''}`;
							if (cs.transitionProperty !== 'none' && longest(cs.transitionDuration) > 0) {
								found.push(`transition: ${name}`);
							}
							if (cs.animationName !== 'none' && longest(cs.animationDuration) > 0) {
								found.push(`animation: ${name}`);
							}
						}
					}
					return found;
				});
				expect.soft(moving, path).toEqual([]);
			});
		}
	});
});
