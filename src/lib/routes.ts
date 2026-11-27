import { Briefcase, Newspaper } from '@lucide/svelte';
import type { Component } from 'svelte';
import { getPosts } from './posts';

export type RouteInfo = {
	label: string;
	nav?: boolean;
	icon?: Component;
};

// routes.spec.ts fails for any page missing here. Blog posts are the exception: they're labeled
// by their frontmatter title.
export const routes: Record<string, RouteInfo> = {
	'/': { label: 'Home' },
	'/experience': { label: 'Experience', nav: true, icon: Briefcase },
	'/blog': { label: 'Blog', nav: true, icon: Newspaper },
	'/privacy': { label: 'Privacy' }
};

export type NavRoute = RouteInfo & { href: string };

export const navRoutes: NavRoute[] = Object.entries(routes)
	.filter(([, route]) => route.nav)
	.map(([href, route]) => ({ href, ...route }));

export function getRouteLabel(pathname: string): string | undefined {
	return routes[pathname]?.label ?? getPosts().find((post) => post.path === pathname)?.title;
}

// `true` (not `page`) inside a section, so the Blog link stays marked while reading a post.
export function getAriaCurrent(href: string, pathname: string): 'page' | 'true' | undefined {
	if (pathname === href) return 'page';
	if (pathname.startsWith(`${href}/`)) return 'true';
	return undefined;
}
