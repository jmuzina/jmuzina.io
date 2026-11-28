import { afterEach, describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Navigation from './Navigation.svelte';

const appState = vi.hoisted(() => ({ page: { url: new URL('http://localhost/') } }));
vi.mock('$app/state', () => appState);

const setPath = (path: string) => (appState.page.url = new URL(path, 'http://localhost'));

// csr is disabled, so the toggle is an inline script. Svelte runs it on mount, but the test page
// has no `js` class and the script's document listeners outlive each test, so replay the rendered
// markup in a same-origin iframe (as in privacy/page.svelte.spec.ts) with the class app.html sets.
async function mountInFrame() {
	const { container } = await render(Navigation);
	const frame = document.createElement('iframe');
	const loaded = new Promise((resolve) => frame.addEventListener('load', resolve, { once: true }));
	frame.srcdoc = `<html class="js"><body>${container.innerHTML}<button id="outside">elsewhere</button></body></html>`;
	document.body.append(frame);
	await loaded;

	const doc = frame.contentDocument!;
	const frameWindow = frame.contentWindow as typeof window;
	const toggle = doc.getElementById('nav-toggle') as HTMLButtonElement;
	const pressEscape = (target: HTMLElement) => {
		target.focus();
		target.dispatchEvent(
			new frameWindow.KeyboardEvent('keydown', { key: 'Escape', bubbles: true })
		);
	};
	return { doc, toggle, pressEscape };
}

describe('Navigation.svelte', () => {
	afterEach(() => {
		setPath('/');
		document.querySelectorAll('iframe').forEach((frame) => frame.remove());
	});

	describe('aria-current', () => {
		it('marks the current page', async () => {
			setPath('/experience');
			const { container } = await render(Navigation);
			const link = container.querySelector('nav a[href="/experience"]');
			expect(link?.getAttribute('aria-current')).toBe('page');
		});

		it('marks the section when on a page inside it', async () => {
			setPath('/experience/some-role');
			const { container } = await render(Navigation);
			const link = container.querySelector('nav a[href="/experience"]');
			expect(link?.getAttribute('aria-current')).toBe('true');
		});

		it('leaves other links unmarked', async () => {
			setPath('/privacy');
			const { container } = await render(Navigation);
			expect(container.querySelectorAll('nav a[aria-current]')).toHaveLength(0);
		});
	});

	describe('mobile toggle', () => {
		it('is a labeled disclosure button for the main nav', async () => {
			const { container } = await render(Navigation);
			const toggle = container.querySelector('#nav-toggle')!;
			expect(toggle.getAttribute('aria-controls')).toBe('main-nav');
			expect(toggle.getAttribute('aria-expanded')).toBe('false');
			expect(toggle.textContent?.trim()).toBe('Menu');
			expect(container.querySelector('nav#main-nav')).not.toBeNull();
		});

		it('opens and closes on click', async () => {
			const { toggle } = await mountInFrame();
			toggle.click();
			expect(toggle.getAttribute('aria-expanded')).toBe('true');
			toggle.click();
			expect(toggle.getAttribute('aria-expanded')).toBe('false');
		});

		it('closes on Escape from inside the menu and returns focus to the toggle', async () => {
			const { doc, toggle, pressEscape } = await mountInFrame();
			toggle.click();
			pressEscape(doc.querySelector<HTMLElement>('#main-nav a')!);
			expect(toggle.getAttribute('aria-expanded')).toBe('false');
			expect(doc.activeElement).toBe(toggle);
		});

		it('ignores Escape while focus is elsewhere on the page', async () => {
			const { doc, toggle, pressEscape } = await mountInFrame();
			toggle.click();
			const outside = doc.getElementById('outside')!;
			pressEscape(outside);
			expect(toggle.getAttribute('aria-expanded')).toBe('true');
			expect(doc.activeElement).toBe(outside);
		});
	});
});
