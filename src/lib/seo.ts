import type { Post } from './posts';

export const AUTHOR = 'Julie Mužina';

export type SocialImage = {
	src: string;
	alt: string;
	type?: string;
	width?: number;
	height?: number;
	large: boolean;
};

const DEFAULT_IMAGE: SocialImage = {
	src: '/assets/julie.jpeg',
	alt: 'Portrait of Julie Mužina',
	type: 'image/jpeg',
	width: 400,
	height: 396,
	large: false
};

export function getSocialImage(post?: Post): SocialImage {
	if (!post?.image) return DEFAULT_IMAGE;
	return { src: post.image, alt: post.imageAlt!, large: true };
}

// Built here rather than in a component: Svelte would end its own <script> block at the tag.
export function blogPostingJsonLd(post: Post, origin: string): string {
	const url = new URL(post.path, origin).href;
	const data = {
		'@context': 'https://schema.org',
		'@type': 'BlogPosting',
		headline: post.title,
		description: post.description,
		datePublished: post.date,
		dateModified: post.updated ?? post.date,
		author: { '@type': 'Person', name: AUTHOR, url: new URL('/', origin).href },
		image: new URL(getSocialImage(post).src, origin).href,
		url,
		mainEntityOfPage: url
	};
	// a "</script>" in any value would otherwise end the block early
	const json = JSON.stringify(data).replace(/</g, '\\u003c');
	return `<script type="application/ld+json">${json}</script>`;
}
