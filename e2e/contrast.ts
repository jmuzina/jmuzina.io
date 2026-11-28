import type { CDPSession, Page } from '@playwright/test';

// axe checks contrast at rest only, and browsers hide :visited colors from scripts
// (getComputedStyle reports the unvisited color). Chromium's DevTools protocol can force
// :visited and report its real color, so this runs in Chromium only; colors don't vary by engine.

const CANDIDATES = 'a[href], button, summary, input, select, textarea';

// Hover is a real mouse move, not a forced :hover, because real hover also matches every
// ancestor (e.g. `.prose:hover a`).
const STATES = [
	{ name: 'hover', hover: true, force: [] },
	{ name: 'visited', hover: false, force: ['visited'], linksOnly: true },
	{ name: 'visited + hover', hover: true, force: ['visited'], linksOnly: true },
	{ name: 'focus', hover: false, force: ['focus', 'focus-visible'], outline: true }
];

type Measurement =
	| { skipped: true }
	| { error: string }
	| { text?: [ratio: number, min: number]; outline?: [ratio: number, min: number] | string };

// Runs in the page, so it can't use anything from this module.
function measure({
	i,
	style,
	outline
}: {
	i: number;
	style: Record<string, string>;
	outline: boolean;
}): Measurement {
	const el = document.querySelector(`[data-contrast="${i}"]`)!;
	const rect = el.getClientRects()[0];
	if (!rect || rect.width <= 1 || rect.height <= 1) return { skipped: true };
	// visually hidden until focused (sr-only clips to nothing), so there's nothing to see
	const cs = getComputedStyle(el);
	const clipped = cs.clipPath !== 'none' || cs.clip !== 'auto';
	const center = [rect.left + rect.width / 2, rect.top + rect.height / 2] as const;
	if (clipped && !document.elementsFromPoint(...center).includes(el)) return { skipped: true };

	const ctx = document.createElement('canvas').getContext('2d', { willReadFrequently: true })!;
	// canvas converts any CSS color (oklch included) to the sRGB the screen shows
	const rgba = (css: string) => {
		ctx.clearRect(0, 0, 1, 1);
		ctx.fillStyle = css;
		ctx.fillRect(0, 0, 1, 1);
		const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
		return [r, g, b, a / 255];
	};
	const over = ([r, g, b, a]: number[], [R, G, B]: number[]) => [
		r * a + R * (1 - a),
		g * a + G * (1 - a),
		b * a + B * (1 - a),
		1
	];
	const luminance = (rgb: number[]) => {
		const [r, g, b] = rgb.map((v) => {
			const c = v / 255;
			return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
		});
		return 0.2126 * r + 0.7152 * g + 0.0722 * b;
	};
	const ratio = (fg: number[], bg: number[]) => {
		const [hi, lo] = [luminance(over(fg, bg)), luminance(bg)].sort((x, y) => y - x);
		return (hi + 0.05) / (lo + 0.05);
	};
	// what is painted at (x, y): from `from` down the stack, leaving out `skip` and its contents
	const backgroundAt = (x: number, y: number, from: Element | null, skip: Element | null) => {
		let stack = document.elementsFromPoint(x, y);
		if (from) {
			if (!stack.includes(from)) return 'covered by another element';
			stack = stack.slice(stack.indexOf(from));
		}
		if (skip) stack = stack.filter((e) => !skip.contains(e));
		const layers: number[][] = [];
		for (const e of stack) {
			const cs = getComputedStyle(e);
			if (cs.backgroundImage !== 'none') return 'background image';
			const color = rgba(cs.backgroundColor);
			if (color[3] > 0) layers.push(color);
			if (color[3] === 1) break;
		}
		if (layers.at(-1)?.[3] !== 1) return 'no opaque background';
		return layers.reduceRight((under, layer) => over(layer, under));
	};

	const result: Exclude<Measurement, { skipped: true } | { error: string }> = {};
	if (!el.matches('input, select, textarea')) {
		const bg = backgroundAt(...center, el, null);
		if (typeof bg === 'string') return { error: bg };
		// sr-only text sits in a 1px box, so it doesn't count as visible text
		const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
		let hasText = false;
		for (let node = walker.nextNode(); node && !hasText; node = walker.nextNode()) {
			const box = node.parentElement!.getBoundingClientRect();
			hasText = !!node.textContent!.trim() && box.width > 1 && box.height > 1;
		}
		const size = parseFloat(style['font-size']);
		const large = size >= 24 || (size >= 18.66 && Number(style['font-weight']) >= 700);
		// icon-only controls are non-text content (WCAG 1.4.11)
		result.text = [ratio(rgba(style.color), bg), hasText && !large ? 4.5 : 3];
	}

	if (outline) {
		const width = parseFloat(style['outline-width']);
		const offset = parseFloat(style['outline-offset']);
		const color = rgba(style['outline-color']);
		if (style['outline-style'] === 'none' || width === 0 || color[3] === 0) {
			result.outline = 'no visible focus outline';
			return result;
		}
		// a point on the outline's middle: outside the box for a positive offset, inside for negative
		let x = rect.left - offset - width / 2;
		if (x < 0) x = rect.right + offset + width / 2;
		const y = rect.top + rect.height / 2;
		const bg = offset < 0 ? backgroundAt(x, y, el, null) : backgroundAt(x, y, null, el);
		result.outline = typeof bg === 'string' ? bg : [ratio(color, bg), 3];
	}
	return result;
}

const STYLE_PROPS = [
	'color',
	'font-size',
	'font-weight',
	'outline-style',
	'outline-width',
	'outline-offset',
	'outline-color'
];

export async function findStateContrastFailures(page: Page, cdp: CDPSession): Promise<string[]> {
	const labels = await page.evaluate((selector) => {
		const visible = [...document.querySelectorAll(selector)].filter((el) => el.checkVisibility());
		return visible.map((el, i) => {
			el.setAttribute('data-contrast', String(i));
			const name = el.getAttribute('aria-label') ?? el.textContent ?? '';
			return {
				tag: el.localName,
				label: `<${el.localName}> ${name.trim().replace(/\s+/g, ' ').slice(0, 40)}`
			};
		});
	}, CANDIDATES);

	await cdp.send('DOM.enable');
	await cdp.send('CSS.enable');
	const { root } = await cdp.send('DOM.getDocument');
	const failures: string[] = [];

	for (const [i, { tag, label }] of labels.entries()) {
		const { nodeId } = await cdp.send('DOM.querySelector', {
			nodeId: root.nodeId,
			selector: `[data-contrast="${i}"]`
		});
		const center = await page.evaluate((i) => {
			const el = document.querySelector(`[data-contrast="${i}"]`)!;
			el.scrollIntoView({ block: 'center', inline: 'center' });
			const rect = el.getClientRects()[0] ?? el.getBoundingClientRect();
			return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
		}, i);

		for (const state of STATES) {
			if (state.linksOnly && tag !== 'a') continue;
			await page.mouse.move(state.hover ? center.x : 0, state.hover ? center.y : 0);
			await cdp.send('CSS.forcePseudoState', { nodeId, forcedPseudoClasses: state.force });
			// the protocol reports the real :visited color, where getComputedStyle would not
			const { computedStyle } = await cdp.send('CSS.getComputedStyleForNode', { nodeId });
			const style = Object.fromEntries(
				computedStyle.filter((p) => STYLE_PROPS.includes(p.name)).map((p) => [p.name, p.value])
			);
			const result = await page.evaluate(measure, { i, style, outline: !!state.outline });
			await cdp.send('CSS.forcePseudoState', { nodeId, forcedPseudoClasses: [] });

			const where = `${label} [${state.name}]`;
			if ('skipped' in result) continue;
			if ('error' in result) {
				failures.push(`${where}: can't measure, ${result.error}`);
				continue;
			}
			if (result.text && result.text[0] < result.text[1]) {
				failures.push(`${where}: text ${result.text[0].toFixed(2)}:1, needs ${result.text[1]}:1`);
			}
			if (typeof result.outline === 'string') failures.push(`${where}: ${result.outline}`);
			else if (result.outline && result.outline[0] < result.outline[1]) {
				failures.push(`${where}: outline ${result.outline[0].toFixed(2)}:1, needs 3:1`);
			}
		}
	}
	await page.mouse.move(0, 0);
	return failures;
}
