import { describe, expect, it, vi } from 'vitest';
import type { Education } from './experience';
import type { Post } from './posts';
import { blogPostingJsonLd, getSocialImage, personJsonLd } from './seo';

const experience = vi.hoisted(() => {
	const school = (institution: string, endDate?: Date): Education => ({
		institution,
		location: 'Somewhere',
		websiteUrl: `https://${institution.toLowerCase()}.edu`,
		program: 'B.S',
		startDate: new Date('2018-01-01'),
		endDate,
		grade: '4.0'
	});
	return {
		currentJob: { company: 'Acme', title: 'Engineer', websiteUrl: 'https://acme.test' },
		educations: [school('Finished', new Date('2022-01-01')), school('Ongoing')]
	};
});
vi.mock('./experience', () => experience);

const post: Post = {
	title: 'A post',
	date: '2026-01-01T00:00:00.000Z',
	description: 'About it',
	path: '/blog/a-post'
};

const parse = (html: string) => {
	const match = html.match(/^<script type="application\/ld\+json">(.*)<\/script>$/s);
	expect(match).not.toBeNull();
	return JSON.parse(match![1]);
};

describe('getSocialImage', () => {
	it('falls back to the portrait, as a small card', () => {
		for (const image of [getSocialImage(), getSocialImage(post)]) {
			expect(image).toMatchObject({ src: '/assets/julie.jpeg', width: 400, large: false });
		}
	});

	it("uses a post's own image, as a large card", () => {
		const image = getSocialImage({ ...post, image: '/assets/blog/chart.png', imageAlt: 'A chart' });
		expect(image).toEqual({ src: '/assets/blog/chart.png', alt: 'A chart', large: true });
	});
});

describe('blogPostingJsonLd', () => {
	it('describes the post with absolute URLs', () => {
		expect(parse(blogPostingJsonLd(post, 'https://jmuzina.io'))).toEqual({
			'@context': 'https://schema.org',
			'@type': 'BlogPosting',
			headline: 'A post',
			description: 'About it',
			datePublished: '2026-01-01T00:00:00.000Z',
			dateModified: '2026-01-01T00:00:00.000Z',
			author: { '@type': 'Person', name: 'Julie Mužina', url: 'https://jmuzina.io/' },
			image: 'https://jmuzina.io/assets/julie.jpeg',
			url: 'https://jmuzina.io/blog/a-post',
			mainEntityOfPage: 'https://jmuzina.io/blog/a-post'
		});
	});

	it('uses the updated date and post image when given', () => {
		const data = parse(
			blogPostingJsonLd(
				{
					...post,
					updated: '2026-02-01T00:00:00.000Z',
					image: '/assets/blog/chart.png',
					imageAlt: 'A chart'
				},
				'https://jmuzina.io'
			)
		);
		expect(data.dateModified).toBe('2026-02-01T00:00:00.000Z');
		expect(data.image).toBe('https://jmuzina.io/assets/blog/chart.png');
	});

	it('cannot be closed early by a value', () => {
		const html = blogPostingJsonLd(
			{ ...post, title: '</script><script>alert(1)</script>' },
			'https://jmuzina.io'
		);
		expect(html.match(/<\/script>/g)).toHaveLength(1);
		expect(parse(html).headline).toBe('</script><script>alert(1)</script>');
	});
});

describe('personJsonLd', () => {
	it('describes Julie with absolute URLs', () => {
		expect(parse(personJsonLd('https://jmuzina.io'))).toMatchObject({
			'@context': 'https://schema.org',
			'@type': 'Person',
			name: 'Julie Mužina',
			url: 'https://jmuzina.io/',
			image: 'https://jmuzina.io/assets/julie.jpeg'
		});
	});

	it('names the current job, finished schools and profiles', () => {
		expect(parse(personJsonLd('https://jmuzina.io'))).toMatchObject({
			jobTitle: 'Engineer',
			worksFor: { '@type': 'Organization', name: 'Acme', url: 'https://acme.test' },
			alumniOf: [{ '@type': 'CollegeOrUniversity', name: 'Finished', url: 'https://finished.edu' }],
			sameAs: ['https://github.com/jmuzina', 'https://linkedin.com/in/jmuzina']
		});
	});
});
