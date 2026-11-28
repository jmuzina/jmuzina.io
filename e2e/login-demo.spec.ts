import { expect, test, type Page } from '@playwright/test';
import { tabKey } from './helpers';

const POST = '/blog/nobody-typed-your-password';

const keystroke = (page: Page) =>
	page.getByRole('figure', { name: 'Demo: the button waits for a keystroke' });
const autofillAware = (page: Page) =>
	page.getByRole('figure', { name: 'Demo: the button waits for input or autofill' });
const submit = (page: Page) =>
	page.getByRole('figure', { name: 'Demo: the button is always enabled' });

test.beforeEach(async ({ page }) => {
	await page.goto(POST);
});

test.describe('the keystroke-gated demo', () => {
	test('stays disabled when a script fills it', async ({ page }) => {
		const demo = keystroke(page);
		await demo.getByRole('button', { name: 'Simulate autofill' }).click();

		await expect(demo.getByLabel('Email')).toHaveValue('reader@example.com');
		await expect(demo.getByLabel('Password')).not.toHaveValue('');
		await expect(demo.getByRole('button', { name: 'Log in' })).toBeDisabled();
		await expect(demo.getByRole('status')).toHaveText('Filled by script, no key presses.');
		await expect(demo.getByRole('listitem').filter({ hasText: 'untrusted' }).first()).toBeVisible();
	});

	// fill() sets the value and fires input, like paste from a menu: no key events
	test('stays disabled when text arrives without key presses', async ({ page }) => {
		const demo = keystroke(page);
		await demo.getByLabel('Email').fill('reader@example.com');
		await demo.getByLabel('Password').fill('hunter2');

		await expect(demo.getByRole('button', { name: 'Log in' })).toBeDisabled();
	});

	test('enables once both fields are typed into', async ({ page }) => {
		const demo = keystroke(page);
		await demo.getByLabel('Email').pressSequentially('a@b.c');
		await expect(demo.getByRole('button', { name: 'Log in' })).toBeDisabled();
		await demo.getByLabel('Password').pressSequentially('x');

		await expect(demo.getByRole('button', { name: 'Log in' })).toBeEnabled();
	});
});

test.describe('the input-or-autofill demo', () => {
	test('enables when a script fills it, without key presses', async ({ page }) => {
		const demo = autofillAware(page);
		await expect(demo.getByRole('button', { name: 'Log in' })).toBeDisabled();
		await demo.getByRole('button', { name: 'Simulate autofill' }).click();

		await expect(demo.getByRole('button', { name: 'Log in' })).toBeEnabled();
	});

	test('disables again when a field is emptied', async ({ page }) => {
		const demo = autofillAware(page);
		await demo.getByRole('button', { name: 'Simulate autofill' }).click();
		await demo.getByLabel('Password').fill('');

		await expect(demo.getByRole('button', { name: 'Log in' })).toBeDisabled();
	});

	test('still validates on submit', async ({ page }) => {
		const demo = autofillAware(page);
		await demo.getByRole('button', { name: 'Simulate autofill' }).click();
		await demo.getByLabel('Email').fill('not an email');
		await demo.getByRole('button', { name: 'Log in' }).click();

		await expect(demo.getByLabel('Email')).toBeFocused();
		await expect(demo.getByLabel('Email')).toHaveAttribute('aria-invalid', 'true');
	});
});

test.describe('the always-enabled demo', () => {
	test('explains empty fields on submit and moves focus to the first', async ({ page }) => {
		const demo = submit(page);
		await expect(demo.getByLabel('Email')).toHaveAccessibleDescription('');
		await demo.getByRole('button', { name: 'Log in' }).click();

		await expect(demo.getByLabel('Email')).toBeFocused();
		await expect(demo.getByLabel('Email')).toHaveAccessibleDescription('Enter your email address.');
		await expect(demo.getByLabel('Email')).toHaveAttribute('aria-invalid', 'true');
		await expect(demo.getByLabel('Password')).toHaveAttribute('aria-invalid', 'true');
		await expect(demo.getByRole('status')).toHaveText('');
	});

	test('logs in after a script fills it', async ({ page }) => {
		const demo = submit(page);
		await demo.getByRole('button', { name: 'Log in' }).click();
		await demo.getByRole('button', { name: 'Simulate autofill' }).click();
		await demo.getByRole('button', { name: 'Log in' }).click();

		await expect(demo.getByRole('status')).toHaveText('Logged in. (Not really: nothing was sent.)');
		await expect(demo.getByText('Enter your email address.')).toBeHidden();
		await expect(demo.getByLabel('Email')).toHaveAccessibleDescription('');
		await expect(demo.getByLabel('Password')).toHaveAttribute('aria-invalid', 'false');
	});

	test('every control shows the link focus ring', async ({ page, browserName }) => {
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
		const demo = submit(page);
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

test('a script calling form.submit() sends nothing', async ({ page }) => {
	const leaked = page.waitForRequest(/[?&]password=/, { timeout: 2000 }).then(
		() => true,
		() => false
	);
	for (const demo of [keystroke(page), autofillAware(page), submit(page)]) {
		await demo.getByRole('button', { name: 'Simulate autofill' }).click();
		await demo.locator('form').evaluate((form: HTMLFormElement) => {
			try {
				form.submit();
			} catch {
				// Firefox throws for a dialog form outside a <dialog>, which is also fine
			}
		});
	}

	expect(await leaked).toBe(false);
});

test('without JavaScript the demos say they need it', { tag: '@no-js' }, async ({ page }) => {
	for (const demo of [keystroke(page), autofillAware(page), submit(page)]) {
		await expect(demo.getByText('This demo needs JavaScript.')).toBeVisible();
		await expect(demo.getByRole('textbox')).toHaveCount(0);
	}
});
