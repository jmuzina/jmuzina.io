import { describe, expect, it } from 'vitest';
import { e2ePort } from './e2e-port';

const main = '/Users/someone/repos/jmuzina.io';
const worktrees = Array.from({ length: 200 }, (_, i) => `${main}/.claude/worktrees/agent-${i}`);

describe('e2ePort', () => {
	it('gives a checkout the same port on every run', () => {
		expect(e2ePort(main, {})).toBe(e2ePort(main, {}));
	});

	it('gives different checkouts different ports', () => {
		const ports = new Set([main, ...worktrees].map((dir) => e2ePort(dir, {})));
		// Collisions are possible in a range of 1000; most checkouts must still get their own.
		expect(ports.size).toBeGreaterThan(150);
	});

	it('stays from 4173 up to, not including, the dev server on 5173', () => {
		for (const dir of [main, ...worktrees, '/work', '']) {
			const port = e2ePort(dir, {});
			expect(Number.isInteger(port)).toBe(true);
			expect(port).toBeGreaterThanOrEqual(4173);
			expect(port).toBeLessThan(5173);
		}
	});

	it('uses E2E_PORT when set', () => {
		expect(e2ePort(main, { E2E_PORT: '6000' })).toBe(6000);
	});

	it.each(['abc', '0', '65536', '4173.5'])('rejects E2E_PORT=%s', (value) => {
		expect(() => e2ePort(main, { E2E_PORT: value })).toThrow(`got "${value}"`);
	});
});
