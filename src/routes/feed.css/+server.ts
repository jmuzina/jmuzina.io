import css from '../../feed.css?inline';
import type { RequestHandler } from './$types';

export const prerender = true;

export const GET: RequestHandler = () =>
	new Response(css, { headers: { 'Content-Type': 'text/css' } });
