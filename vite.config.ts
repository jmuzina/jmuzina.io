import adapter from '@sveltejs/adapter-static';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import devtoolsJson from 'vite-plugin-devtools-json';
import { defineConfig } from 'vite';
import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { mdsvex } from 'mdsvex';
import { headingAnchors } from './src/lib/markdown/heading-anchors.ts';

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

const fromRoot = (path: string) => fileURLToPath(new URL(path, import.meta.url));

// Shared with the vitest configs, which otherwise can't import .md files.
// mdsvex resolves `layout` paths relative to each Markdown file, so they must be absolute. A named
// layout applies to every file under a folder of that name: `blog` covers all posts.
export const svelteOptions = {
	extensions: ['.svelte', '.md'],
	preprocess: [
		mdsvex({
			extensions: ['.md'],
			layout: { blog: fromRoot('./src/lib/components/BlogPost.svelte') },
			rehypePlugins: [headingAnchors]
		})
	]
};

export default defineConfig({
	define: defineGitInfo,
	plugins: [
		tailwindcss(),
		sveltekit({
			...svelteOptions,
			adapter: adapter({ precompress: true }),
			paths: { origin: process.env.SITE_ORIGIN || 'https://jmuzina.io' }
		}),
		devtoolsJson()
	],
	// The watcher doesn't read .gitignore. Anchored to the root, because a worktree under
	// .claude/ runs its own dev server, and `**/.claude/**` would ignore its whole tree.
	server: { watch: { ignored: [`${fromRoot('./.claude')}/**`] } }
});
