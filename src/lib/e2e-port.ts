// Each checkout (e.g. a git worktree) gets its own preview port, so parallel e2e runs never meet
// on one server. The range stops short of 5173, where `pnpm dev` listens.
export function e2ePort(checkoutDir: string, env: NodeJS.ProcessEnv = process.env): number {
	if (env.E2E_PORT) {
		const port = Number(env.E2E_PORT);
		if (!Number.isInteger(port) || port < 1 || port > 65535) {
			throw new Error(`E2E_PORT must be a port number, got "${env.E2E_PORT}".`);
		}
		return port;
	}
	let hash = 0;
	for (const char of checkoutDir) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
	return 4173 + (hash % 1000);
}
