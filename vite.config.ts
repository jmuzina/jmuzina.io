import { execSync } from 'node:child_process';
import devtoolsJson from 'vite-plugin-devtools-json';
import { defineConfig } from 'vitest/config';
import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';

function getGitCommitSha(): string {
	if (process.env.PUBLIC_GIT_SHA) return process.env.PUBLIC_GIT_SHA;
	if (process.env.GITHUB_SHA) return process.env.GITHUB_SHA;
	try {
		return execSync('git rev-parse HEAD').toString().trim();
	} catch {
		return '';
	}
}

function getGitCommitDate(): string {
	if (process.env.PUBLIC_GIT_DATE) return process.env.PUBLIC_GIT_DATE;
	try {
		return execSync('git log -1 --format=%cI').toString().trim();
	} catch {
		return new Date().toISOString();
	}
}

export const defineGitInfo = {
	__COMMIT_SHA__: JSON.stringify(getGitCommitSha()),
	__COMMIT_DATE__: JSON.stringify(getGitCommitDate())
};

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
export default defineConfig({
	define: defineGitInfo,
	plugins: [tailwindcss(), sveltekit(), devtoolsJson()]
});
