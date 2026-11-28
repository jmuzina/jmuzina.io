import { expect, test, type Locator, type Page } from '@playwright/test';
import { tabKey } from './helpers';

const POST = '/blog/nobody-typed-your-password';

const MODES = [
	{
		mode: 'keystroke',
		link: 'Waits for a keystroke',
		caption: 'Demo: the button waits for a keystroke'
	},
	{ mode: 'submit', link: 'Always enabled', caption: 'Demo: the button is always enabled' },
	{
		mode: 'autofill-aware',
		link: 'Waits for input or autofill',
		caption: 'Demo: the button waits for input or autofill'
	}
] as const;
type Mode = (typeof MODES)[number]['mode'];

const captionOf = (mode: Mode) => MODES.find((entry) => entry.mode === mode)!.caption;

async function openDemo(page: Page, mode: Mode) {
	await page.goto(`${POST}?mode=${mode}`);
	return page.getByRole('figure', { name: captionOf(mode) });
}

// The mode links are list items too
const logEntries = (demo: Locator) => demo.locator('[data-log] > li');

test.describe('the mode links', () => {
	for (const [index, { mode, link, caption }] of MODES.entries()) {
		test(`"${link}" reloads into that mode at the demo`, async ({ page }) => {
			// Start in another mode with the fields filled, so a missed reload shows.
			const from = MODES[(index + 1) % MODES.length].mode;
			const before = await openDemo(page, from);
			await before.getByRole('button', { name: 'Simulate autofill' }).click();
			await before.getByRole('link', { name: link }).click();

			await expect(page).toHaveURL(new RegExp(`\\?mode=${mode}#demo$`));
			const demo = page.getByRole('figure', { name: caption });
			await expect(demo).toBeInViewport();
			await expect(demo.getByLabel('Email')).toHaveValue('');
			await expect(demo.getByRole('link', { name: link })).toHaveAttribute('aria-current', 'page');
			for (const other of MODES.filter((entry) => entry.mode !== mode)) {
				await expect(demo.getByRole('link', { name: other.link })).not.toHaveAttribute(
					'aria-current'
				);
			}
		});
	}

	for (const search of ['', '?mode=nonsense']) {
		test(`${search || 'no query string'} falls back to the keystroke mode`, async ({ page }) => {
			await page.goto(POST + search);
			const demo = page.getByRole('figure', { name: captionOf('keystroke') });

			await expect(demo.getByRole('link', { name: 'Waits for a keystroke' })).toHaveAttribute(
				'aria-current',
				'page'
			);
			await expect(demo.getByRole('button', { name: 'Log in' })).toBeDisabled();
		});
	}

	// Plain links, so they get the site's link ring, whatever the browser makes of it
	test('are reachable by keyboard with a visible ring', async ({ page, browserName }) => {
		const demo = await openDemo(page, 'submit');
		await demo.getByLabel('Email').click();
		for (const { link } of [...MODES].reverse()) {
			await page.keyboard.press(`Shift+${tabKey(browserName)}`);
			await expect(demo.getByRole('link', { name: link })).toBeFocused();
			await expect(demo.getByRole('link', { name: link })).not.toHaveCSS('outline-style', 'none');
		}
	});
});

test.describe('the keystroke mode', () => {
	test('stays disabled when a script fills it', async ({ page }) => {
		const demo = await openDemo(page, 'keystroke');
		await demo.getByRole('button', { name: 'Simulate autofill' }).click();

		await expect(demo.getByLabel('Email')).toHaveValue('reader@example.com');
		await expect(demo.getByLabel('Password')).not.toHaveValue('');
		await expect(demo.getByRole('button', { name: 'Log in' })).toBeDisabled();
		await expect(demo.getByRole('status')).toHaveText('Filled by script, no key presses.');
		await expect(logEntries(demo).filter({ hasText: 'untrusted' }).first()).toBeVisible();
	});

	// fill() sets the value and fires input, like paste from a menu: no key events
	test('stays disabled when text arrives without key presses', async ({ page }) => {
		const demo = await openDemo(page, 'keystroke');
		await demo.getByLabel('Email').fill('reader@example.com');
		await demo.getByLabel('Password').fill('hunter2');

		await expect(demo.getByRole('button', { name: 'Log in' })).toBeDisabled();
	});

	test('enables once both fields are typed into', async ({ page }) => {
		const demo = await openDemo(page, 'keystroke');
		await demo.getByLabel('Email').pressSequentially('a@b.c');
		await expect(demo.getByRole('button', { name: 'Log in' })).toBeDisabled();
		await demo.getByLabel('Password').pressSequentially('x');

		await expect(demo.getByRole('button', { name: 'Log in' })).toBeEnabled();
	});
});

test.describe('the input-or-autofill mode', () => {
	test('enables when a script fills it, without key presses', async ({ page }) => {
		const demo = await openDemo(page, 'autofill-aware');
		await expect(demo.getByRole('button', { name: 'Log in' })).toBeDisabled();
		await demo.getByRole('button', { name: 'Simulate autofill' }).click();

		await expect(demo.getByRole('button', { name: 'Log in' })).toBeEnabled();
	});

	test('disables again when a field is emptied', async ({ page }) => {
		const demo = await openDemo(page, 'autofill-aware');
		await demo.getByRole('button', { name: 'Simulate autofill' }).click();
		await demo.getByLabel('Password').fill('');

		await expect(demo.getByRole('button', { name: 'Log in' })).toBeDisabled();
	});

	test('still validates on submit', async ({ page }) => {
		const demo = await openDemo(page, 'autofill-aware');
		await demo.getByRole('button', { name: 'Simulate autofill' }).click();
		await demo.getByLabel('Email').fill('not an email');
		await demo.getByRole('button', { name: 'Log in' }).click();

		await expect(demo.getByLabel('Email')).toBeFocused();
		await expect(logEntries(demo).first()).toHaveText(/^invalid email: /);
		await expect(demo.getByRole('status')).toHaveText('');
	});
});

test.describe('the always-enabled mode', () => {
	test('the browser blocks an empty submit and focuses the first field', async ({ page }) => {
		const demo = await openDemo(page, 'submit');
		await demo.getByRole('button', { name: 'Log in' }).click();

		await expect(demo.getByLabel('Email')).toBeFocused();
		await expect(logEntries(demo).filter({ hasText: /^invalid email: 0 chars/ })).toHaveCount(1);
		await expect(logEntries(demo).filter({ hasText: /^submit / })).toHaveCount(0);
		await expect(demo.getByRole('status')).toHaveText('');
	});

	test('focuses the first invalid field and clears the status', async ({ page }) => {
		const demo = await openDemo(page, 'submit');
		await demo.getByRole('button', { name: 'Simulate autofill' }).click();
		await demo.getByLabel('Password').fill('');
		await demo.getByRole('button', { name: 'Log in' }).click();

		await expect(demo.getByLabel('Password')).toBeFocused();
		await expect(demo.getByRole('status')).toHaveText('');
	});

	test('logs in after a script fills it', async ({ page }) => {
		const demo = await openDemo(page, 'submit');
		await demo.getByRole('button', { name: 'Log in' }).click();
		await demo.getByRole('button', { name: 'Simulate autofill' }).click();
		await demo.getByRole('button', { name: 'Log in' }).click();

		await expect(demo.getByRole('status')).toHaveText('Logged in. (Not really: nothing was sent.)');
		await expect(logEntries(demo).first()).toHaveText(/^submit password: [1-9]/);
	});

	test('every control shows the link focus ring', async ({ page, browserName }) => {
		const demo = await openDemo(page, 'submit');
		const ring = await page.evaluate(() => {
			const link = document.createElement('a');
			link.href = '#';
			document.querySelector('main')!.append(link);
			const style = getComputedStyle(link);
			const ring = {
				'outline-width': style.outlineWidth,
				'outline-color': style.outlineColor,
				'outline-offset': style.outlineOffset
			};
			link.remove();
			return ring;
		});
		const controls = [
			demo.getByLabel('Email'),
			demo.getByLabel('Password'),
			demo.getByRole('button', { name: 'Simulate autofill' }),
			demo.getByRole('button', { name: 'Log in' })
		];

		await controls[0].click();
		for (const control of controls) {
			await expect(control).toBeFocused();
			await expect(control).toHaveCSS('outline-style', 'solid');
			for (const [property, value] of Object.entries(ring)) {
				await expect(control).toHaveCSS(property, value);
			}
			await page.keyboard.press(tabKey(browserName));
		}
	});
});

for (const { mode } of MODES) {
	test(`a script calling form.submit() in the ${mode} mode sends nothing`, async ({ page }) => {
		const demo = await openDemo(page, mode);
		const leaked = page.waitForRequest(/[?&]password=/, { timeout: 2000 }).then(
			() => true,
			() => false
		);
		await demo.getByRole('button', { name: 'Simulate autofill' }).click();
		await demo.locator('form').evaluate((form: HTMLFormElement) => {
			try {
				form.submit();
			} catch {
				// Firefox throws for a dialog form outside a <dialog>, which is also fine
			}
		});

		expect(await leaked).toBe(false);
	});
}

test('without JavaScript the demo says it needs it', { tag: '@no-js' }, async ({ page }) => {
	await page.goto(POST);
	const demo = page.getByRole('figure', { name: captionOf('keystroke') });

	await expect(demo.getByText('This demo needs JavaScript.')).toBeVisible();
	await expect(demo.getByRole('textbox')).toHaveCount(0);
	await expect(demo.getByRole('link')).toHaveCount(0);
});
