// Not in app.d.ts: wildcard module declarations aren't allowed in a file that is a module.
declare module '*.md' {
	import type { Component } from 'svelte';

	export const metadata: Record<string, unknown>;
	const component: Component;
	export default component;
}
