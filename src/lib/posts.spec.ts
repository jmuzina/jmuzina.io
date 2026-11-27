import { describe, expect, it } from 'vitest';
import { getPosts, toPosts, type PostMetadata } from './posts';

const metadata = (overrides: Partial<PostMetadata> = {}): PostMetadata => ({
	title: 'A post',
	date: '2026-01-01T00:00:00.000Z',
	description: 'About it',
	...overrides
});

describe('toPosts', () => {
	it('derives each post path from its route file and sorts newest first', () => {
		const posts = toPosts({
			'/src/routes/blog/older/+page.md': metadata({ title: 'Older' }),
			'/src/routes/blog/newer/+page.md': metadata({
				title: 'Newer',
				date: '2026-03-01T00:00:00.000Z',
				description: 'Fresh'
			})
		});
		expect(posts).toEqual([
			{
				title: 'Newer',
				date: '2026-03-01T00:00:00.000Z',
				description: 'Fresh',
				path: '/blog/newer'
			},
			{
				title: 'Older',
				date: '2026-01-01T00:00:00.000Z',
				description: 'About it',
				path: '/blog/older'
			}
		]);
	});

	it('skips route files that have no static path', () => {
		const posts = toPosts({
			'/src/routes/blog/[slug]/+page.md': metadata({ title: 'Dynamic' }),
			'/src/routes/blog/real/+page.md': metadata({ title: 'Real' })
		});
		expect(posts.map((post) => post.path)).toEqual(['/blog/real']);
	});

	it('is empty when there are no posts', () => {
		expect(toPosts({})).toEqual([]);
	});

	it.each(['title', 'date', 'description'] as const)(
		'names the file when a post has no %s',
		(field) => {
			const file = '/src/routes/blog/draft/+page.md';
			const incomplete: Partial<PostMetadata> = metadata();
			delete incomplete[field];
			expect(() => toPosts({ [file]: incomplete as PostMetadata })).toThrow(
				`${file}: frontmatter needs a "${field}"`
			);
		}
	);

	it.each(['date', 'updated'] as const)(
		'rejects a "%s" that is not an unquoted YAML date',
		(field) => {
			const file = '/src/routes/blog/draft/+page.md';
			for (const value of ['2026-11-20', '2026-11-20T00:00:00Z', 'Nov 20 2026', 'soon']) {
				expect(() => toPosts({ [file]: metadata({ [field]: value }) }), value).toThrow(
					`${file}: frontmatter "${field}" must be an unquoted date`
				);
			}
			expect(() =>
				toPosts({ [file]: metadata({ [field]: '2026-11-20T00:00:00.000Z' }) })
			).not.toThrow();
		}
	);

	it('rejects an image without alt text', () => {
		const file = '/src/routes/blog/draft/+page.md';
		expect(() => toPosts({ [file]: metadata({ image: '/assets/blog/draft.png' }) })).toThrow(
			`${file}: frontmatter needs an "imageAlt"`
		);
		expect(() =>
			toPosts({ [file]: metadata({ image: '/assets/blog/draft.png', imageAlt: 'A chart' }) })
		).not.toThrow();
	});
});

describe('getPosts', () => {
	it('only returns posts under /blog', () => {
		for (const post of getPosts()) expect(post.path).toMatch(/^\/blog\/[^/]+$/);
	});
});
