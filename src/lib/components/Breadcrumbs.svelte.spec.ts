import axe from 'axe-core';
import { createRawSnippet } from 'svelte';
import { commands } from 'vitest/browser';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { MIN_BREADCRUMB_DEPTH } from '#lib/breadcrumbs.ts';
import { getPagePathnames } from '#lib/sitemap.ts';
import appHtml from '../../app.html?raw';
import Layout from '../../routes/+layout.svelte';

const appState = vi.hoisted(() => ({ page: { url: new URL('http://localhost/') } }));
vi.mock('$app/state', () => appState);

// Render through the root layout so breadcrumbs are tested where they're placed, with site styles.
async function renderAt(path: string) {
	appState.page.url = new URL(path, 'http://localhost');
	const children = createRawSnippet(() => ({ render: () => '<h1>Page</h1>' }));
	const { container } = await render(Layout, { children });
	return container.querySelector<HTMLElement>('nav[aria-label="Breadcrumb"]');
}

const crumbsOf = (nav: HTMLElement) =>
	[...nav.querySelectorAll('li a')].map((a) => [a.getAttribute('href'), a.textContent?.trim()]);

beforeAll(() => {
	// Mirror the <html> attributes from app.html so theme tokens resolve as in prod.
	const htmlTag = new DOMParser().parseFromString(appHtml, 'text/html').documentElement;
	for (const { name, value } of htmlTag.attributes) {
		document.documentElement.setAttribute(name, value);
	}
});

afterEach(() => commands.emulateColorScheme('light'));

describe('Breadcrumbs.svelte', () => {
	const shallowPages = getPagePathnames().filter(
		(path) => path.split('/').filter(Boolean).length < MIN_BREADCRUMB_DEPTH
	);

	it.each(shallowPages)('is not shown on %s', async (path) => {
		expect(await renderAt(path)).toBeNull();
	});

	it('shows the trail on a nested page', async () => {
		const nav = (await renderAt('/experience/some-role'))!;
		expect(nav).not.toBeNull();
		expect(nav.querySelector('ol')).not.toBeNull();
		expect(crumbsOf(nav)).toEqual([
			['/', 'Home'],
			['/experience', 'Experience'],
			['/experience/some-role', 'Some role']
		]);
	});

	it('marks only the last crumb as the current page', async () => {
		const nav = (await renderAt('/a/b/c'))!;
		const links = [...nav.querySelectorAll('li a')];
		expect(links).toHaveLength(4);
		expect(links.map((a) => a.getAttribute('aria-current'))).toEqual([null, null, null, 'page']);
	});

	it('hides separators from assistive tech', async () => {
		const nav = (await renderAt('/a/b'))!;
		const icons = [...nav.querySelectorAll('svg')];
		expect(icons.length).toBeGreaterThan(0);
		for (const icon of icons) expect(icon.getAttribute('aria-hidden')).toBe('true');
	});

	it.each(['light', 'dark'] as const)('has no axe violations (%s)', async (colorScheme) => {
		await commands.emulateColorScheme(colorScheme);
		const nav = (await renderAt('/experience/some-role'))!;
		const { violations } = await axe.run(nav, {
			runOnly: {
				type: 'tag',
				values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice']
			}
		});
		expect(violations.map((v) => `${v.id}: ${v.help}`)).toEqual([]);
	});
});
