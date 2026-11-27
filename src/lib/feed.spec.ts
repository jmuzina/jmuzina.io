import { describe, expect, it } from 'vitest';
import { commitDate } from './build-info';
import { buildFeed } from './feed';
import type { Post } from './posts';

const older: Post = {
	title: 'Older',
	date: '2026-01-01T00:00:00.000Z',
	updated: '2026-04-01T00:00:00.000Z',
	description: 'First',
	path: '/blog/older'
};
const newer: Post = {
	title: 'Newer',
	date: '2026-03-01T00:00:00.000Z',
	description: 'Second',
	path: '/blog/newer'
};

const feedUpdated = (xml: string) => xml.match(/^\t<updated>(.*)<\/updated>$/m)?.[1];

describe('buildFeed', () => {
	it('is an Atom feed that links to itself and the blog', () => {
		const xml = buildFeed('https://jmuzina.io', [newer]);
		expect(xml).toContain('<feed xmlns="http://www.w3.org/2005/Atom" xml:lang="en">');
		expect(xml).toContain('<link href="https://jmuzina.io/feed.xml" rel="self"/>');
		expect(xml).toContain('<id>https://jmuzina.io/blog</id>');
		expect(xml).toContain('<name>Julie Mužina</name>');
	});

	it('is styled for people who open it in a browser', () => {
		const xml = buildFeed('https://jmuzina.io', [newer, older]);
		expect(xml).toMatch(
			/^<\?xml [^\n]*\?>\n<\?xml-stylesheet href="\/feed.css" type="text\/css"\?>\n/
		);
		// Atom only allows foreign markup before the entries
		const body = xml.indexOf('<body xmlns="http://www.w3.org/1999/xhtml"');
		expect(body).toBeGreaterThan(-1);
		expect(body).toBeLessThan(xml.indexOf('<entry>'));
		expect(xml).toContain('<h2 class="text-xl"><a href="/blog/newer">Newer</a></h2>');
		expect(xml).toContain('<h2 class="text-xl"><a href="/blog/older">Older</a></h2>');
		expect(xml).toContain('datetime="2026-01-01T00:00:00.000Z">Jan 1, 2026</time>');
	});

	it('has an entry for every post', () => {
		const xml = buildFeed('https://jmuzina.io', [newer, older]);
		expect(xml.match(/<entry>/g)).toHaveLength(2);
		expect(xml).toContain(`\t<entry>
		<title>Older</title>
		<link href="https://jmuzina.io/blog/older"/>
		<id>https://jmuzina.io/blog/older</id>
		<published>2026-01-01T00:00:00.000Z</published>
		<updated>2026-04-01T00:00:00.000Z</updated>
		<summary>First</summary>
	</entry>`);
		expect(xml).toContain(
			'<published>2026-03-01T00:00:00.000Z</published>\n\t\t<updated>2026-03-01'
		);
	});

	it('was updated when its most recently changed post was', () => {
		expect(feedUpdated(buildFeed('https://jmuzina.io', [newer, older]))).toBe(
			'2026-04-01T00:00:00.000Z'
		);
	});

	it('falls back to the build commit when there are no posts', () => {
		const xml = buildFeed('https://jmuzina.io', []);
		expect(commitDate).toMatch(/\S/);
		expect(feedUpdated(xml)).toBe(commitDate);
		expect(xml).not.toContain('<entry>');
	});

	it('escapes XML special characters', () => {
		const xml = buildFeed('https://jmuzina.io', [
			{ ...newer, title: 'Tips & <tricks>', description: '"Quoted"' }
		]);
		expect(xml).toContain('<title>Tips &amp; &lt;tricks&gt;</title>');
		expect(xml).toContain('<summary>&quot;Quoted&quot;</summary>');
		expect(xml).toContain('<a href="/blog/newer">Tips &amp; &lt;tricks&gt;</a>');
		expect(xml).toContain('<p>&quot;Quoted&quot;</p>');
	});
});
