import { defineConfig } from 'vitest/config';

// Without this, a bare `vitest` (e.g. `pnpm exec vitest run <file>`) falls back to vite.config.ts,
// which has no test settings: it runs browser specs in Node and finds the copies of every spec in
// .claude/worktrees/.
export default defineConfig({
	test: {
		projects: ['./vitest.config.server.ts', './vitest.config.client.ts']
	}
});
