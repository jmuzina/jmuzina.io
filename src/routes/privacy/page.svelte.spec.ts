import { afterEach, describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Page from './+page.svelte';

const OPT_OUT_KEY = 'matomo-opt-out';

// csr is disabled, so the opt-out logic lives in an inline script. location.reload can't be
// stubbed, so run the rendered markup inside a same-origin iframe and watch for it reloading.
async function mountInFrame() {
	const { container } = await render(Page);
	const frame = document.createElement('iframe');
	const loaded = () =>
		new Promise((resolve) => frame.addEventListener('load', resolve, { once: true }));
	const firstLoad = loaded();
	frame.srcdoc = container.innerHTML;
	document.body.append(frame);
	await firstLoad;
	const checkbox = () =>
		frame.contentDocument!.getElementById('opt-out-checkbox') as HTMLInputElement;
	return { frame, checkbox, loaded };
}

describe('/privacy/+page.svelte', () => {
	afterEach(() => {
		localStorage.removeItem(OPT_OUT_KEY);
		document.querySelectorAll('iframe').forEach((frame) => frame.remove());
	});

	it('should save the opt-out and reload the page when opting out', async () => {
		const { checkbox, loaded } = await mountInFrame();
		expect(checkbox().checked).toBe(false);

		const reloaded = loaded();
		checkbox().click();
		await reloaded;

		expect(localStorage.getItem(OPT_OUT_KEY)).toBe('1');
		expect(checkbox().checked).toBe(true);
	});

	it('should clear the opt-out without reloading when opting back in', async () => {
		localStorage.setItem(OPT_OUT_KEY, '1');
		const { checkbox, loaded } = await mountInFrame();
		expect(checkbox().checked).toBe(true);

		let reloaded = false;
		loaded().then(() => (reloaded = true));
		checkbox().click();
		await new Promise((resolve) => setTimeout(resolve, 200));

		expect(localStorage.getItem(OPT_OUT_KEY)).toBeNull();
		expect(reloaded).toBe(false);
	});
});
