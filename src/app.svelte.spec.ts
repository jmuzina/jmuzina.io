import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { commands, server, userEvent } from 'vitest/browser';
import './app.css';
import appHtml from './app.html?raw';

// A canvas turns any CSS color, oklch included, into sRGB bytes.
function luminance(color: string) {
	const context = document.createElement('canvas').getContext('2d')!;
	context.fillStyle = color;
	context.fillRect(0, 0, 1, 1);
	const [r, g, b] = [...context.getImageData(0, 0, 1, 1).data].map((channel) => {
		const c = channel / 255;
		return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
	});
	return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a: string, b: string) {
	const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x);
	return (light + 0.05) / (dark + 0.05);
}

const ring = (el: Element) => {
	const { outlineWidth, outlineColor, outlineOffset } = getComputedStyle(el);
	return { outlineWidth, outlineColor, outlineOffset };
};

beforeAll(() => {
	// theme tokens resolve from the <html> attributes, as in prod
	const htmlTag = new DOMParser().parseFromString(appHtml, 'text/html').documentElement;
	for (const { name, value } of htmlTag.attributes) {
		document.documentElement.setAttribute(name, value);
	}
	document.body.innerHTML =
		'<a href="#">Link</a><input class="input" aria-label="Field" /><button class="btn">Button</button>';
});

afterEach(() => commands.emulateColorScheme('light'));

it('every heading level gets the same text width as paragraphs', () => {
	const paragraph = document.body.appendChild(document.createElement('p'));
	const headings = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].map((tag) =>
		document.body.appendChild(document.createElement(tag))
	);
	const width = getComputedStyle(paragraph).maxWidth;

	expect(width).not.toBe('none');
	for (const heading of headings) {
		expect(getComputedStyle(heading).maxWidth, heading.tagName).toBe(width);
	}

	for (const el of [paragraph, ...headings]) el.remove();
});

describe.each(['light', 'dark'] as const)('form controls (%s)', (colorScheme) => {
	beforeEach(async () => {
		(document.activeElement as HTMLElement | null)?.blur();
		await commands.emulateColorScheme(colorScheme);
		// .btn transitions its colors, so the switch is mid-way until these finish
		await Promise.all(document.getAnimations().map((animation) => animation.finished));
	});

	it('field edges have 3:1 contrast against the field and the page', () => {
		const field = document.querySelector('.input')!;
		// Skeleton draws the field's only edge as a 1px inset ring
		const edge = getComputedStyle(field).boxShadow.match(
			/(\S+\([^)]*\)) 0px 0px 0px 1px inset/
		)![1];
		const page = getComputedStyle(document.documentElement).backgroundColor;

		expect(contrast(edge, getComputedStyle(field).backgroundColor)).toBeGreaterThanOrEqual(3);
		expect(contrast(edge, page)).toBeGreaterThanOrEqual(3);
	});

	it('fields and buttons show the link focus ring, only when focused by keyboard', async () => {
		const link = document.querySelector('a')!;
		const controls = [document.querySelector('.input')!, document.querySelector('.btn')!];
		// Safari only Tabs to links and buttons with Option held
		const press = (keys: string) =>
			userEvent.keyboard(server.browser === 'webkit' ? `{Alt>}${keys}{/Alt}` : keys);
		for (const control of controls) {
			expect(getComputedStyle(control).outlineStyle).toBe('none');
		}

		await userEvent.click(link);
		const rings = [];
		for (const control of controls) {
			await press('{Tab}');
			expect(document.activeElement).toBe(control);
			expect(getComputedStyle(control).outlineStyle).toBe('solid');
			rings.push(ring(control));
		}

		// back to the link by keyboard, so it shows its ring too
		for (let i = 0; i < controls.length; i++) await press('{Shift>}{Tab}{/Shift}');
		expect(document.activeElement).toBe(link);
		expect(getComputedStyle(link).outlineStyle).toBe('solid');
		for (const controlRing of rings) expect(controlRing).toEqual(ring(link));
	});
});
