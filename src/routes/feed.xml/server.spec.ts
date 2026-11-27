import { describe, expect, it } from 'vitest';
import { GET } from './+server';

describe('GET /feed.xml', () => {
	// e2e can't cover this: preview serves the prerendered file by extension and ignores the header
	it('serves a type browsers display instead of download', async () => {
		const response = await GET({ url: new URL('https://jmuzina.io/feed.xml') } as Parameters<
			typeof GET
		>[0]);
		expect(response.headers.get('content-type')).toBe('text/xml');
	});
});
