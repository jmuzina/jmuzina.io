// axe catches a subset of WCAG
// failures (contrast, names, ARIA misuse); keyboard, screen reader, zoom and
// reduced-motion checks still need to be done by hand.
import axe from 'axe-core';
import { createRawSnippet, flushSync, mount, unmount, type Component } from 'svelte';
import { commands } from 'vitest/browser';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { routeFileToPathname } from '#lib/sitemap.ts';
import appHtml from '../app.html?raw';
import Layout from './+layout.svelte';
import HomePage from './+page.svelte';
import BlogPage from './blog/+page.svelte';
import ExperiencePage from './experience/+page.svelte';
import PrivacyPage from './privacy/+page.svelte';

const appState = vi.hoisted(() => ({ page: { url: new URL('http://localhost/') } }));
vi.mock('$app/state', () => appState);

// By hand, to pair each path with its component; the test below fails when a page is missing.
// Posts are Markdown pages, covered by e2e/a11y.spec.ts.
const routes: [string, Component][] = [
	['/', HomePage],
	['/experience', ExperiencePage],
	['/blog', BlogPage],
	['/privacy', PrivacyPage]
];

it('covers every Svelte page', () => {
	const pages = Object.keys(import.meta.glob('/src/routes/**/+page.svelte'))
		.map(routeFileToPathname)
		.filter((pathname) => pathname !== null)
		.sort();
	expect(routes.map(([path]) => path).sort()).toEqual(pages);
});

const formatViolations = (violations: axe.Result[]) =>
	violations
		.map(
			(v) =>
				`[${v.impact}] ${v.id}: ${v.help} (${v.helpUrl})\n` +
				v.nodes.map((n) => `  - ${n.target.join(' ')}\n    ${n.failureSummary}`).join('\n')
		)
		.join('\n\n');

beforeAll(() => {
	// Mirror the <html> attributes from app.html so theme tokens resolve as in prod.
	const htmlTag = new DOMParser().parseFromString(appHtml, 'text/html').documentElement;
	for (const { name, value } of htmlTag.attributes) {
		document.documentElement.setAttribute(name, value);
	}
});

afterEach(() => commands.emulateColorScheme('light'));

describe.each(['light', 'dark'] as const)('a11y (%s)', (colorScheme) => {
	it.each(routes)('%s has no axe violations', async (path, PageComponent) => {
		appState.page.url = new URL(path, 'http://localhost');
		await commands.emulateColorScheme(colorScheme);

		const children = createRawSnippet(() => ({
			render: () => '<div></div>',
			setup: (target) => {
				const instance = mount(PageComponent, { target: target as HTMLElement });
				return () => unmount(instance);
			}
		}));
		render(Layout, { children });
		flushSync();
		// page title.
		expect(document.querySelectorAll('main h1')).toHaveLength(1);

		const { violations, incomplete } = await axe.run(document, {
			runOnly: {
				type: 'tag',
				values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice']
			}
		});

		// axe reports rules that crash (e.g. on a color it can't parse) as "incomplete"
		// I want to be stricter. so fail if this happens.
		const errored = incomplete.filter((r) => r.error);
		expect(errored.map((r) => `${r.id}: ${r.error?.message}`)).toEqual([]);
		expect(violations, formatViolations(violations)).toEqual([]);
	});
});
