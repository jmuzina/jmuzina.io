import { commitDate } from './build-info';
import { formatPostDate } from './format';
import type { Post } from './posts';
import { AUTHOR } from './seo';
import { escapeXml } from './sitemap';

export const FEED_PATH = '/feed.xml';
export const FEED_STYLESHEET_PATH = '/feed.css';
export const FEED_TITLE = AUTHOR;

const lastModified = (post: Post) => post.updated ?? post.date;

export function buildFeed(origin: string, posts: Post[]): string {
	const url = (path: string) => escapeXml(new URL(path, origin).href);
	// Atom requires <updated>; with no posts yet, the build is the last change
	const updated = posts.map(lastModified).sort().at(-1) ?? commitDate;

	const entries = posts
		.map(
			(post) => `\t<entry>
		<title>${escapeXml(post.title)}</title>
		<link href="${url(post.path)}"/>
		<id>${url(post.path)}</id>
		<published>${escapeXml(post.date)}</published>
		<updated>${escapeXml(lastModified(post))}</updated>
		<summary>${escapeXml(post.description)}</summary>
	</entry>`
		)
		.join('\n');

	// Browsers dropped XSLT, so people opening the feed get this XHTML copy, styled by feed.css.
	// Feed readers ignore it as foreign markup. Atom only allows that before the entries.
	const page = `\t<body xmlns="http://www.w3.org/1999/xhtml" class="min-h-svh bg-surface-50-950 px-6 py-8 lg:px-16" data-theme="renewed-orchid">
		<title>Feed | ${escapeXml(AUTHOR)}</title>
		<meta content="width=device-width, initial-scale=1" name="viewport"/>
		<main class="container mx-auto flex max-w-prose flex-col gap-6">
			<h1 class="text-2xl text-primary-600 dark:text-primary-100">Blog feed</h1>
			<p>Paste this page's address into a feed reader to get new posts. <a href="/blog">Back to the blog</a></p>
			<ol class="flex flex-col gap-6">
${posts
	.map(
		(post) => `\t\t\t\t<li>
					<article class="flex flex-col gap-1">
						<h2 class="text-xl"><a href="${escapeXml(post.path)}">${escapeXml(post.title)}</a></h2>
						<time class="text-sm text-surface-600-400" datetime="${escapeXml(post.date)}">${formatPostDate(post.date)}</time>
						<p>${escapeXml(post.description)}</p>
					</article>
				</li>`
	)
	.join('\n')}
			</ol>
		</main>
	</body>`;

	return `<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet href="${FEED_STYLESHEET_PATH}" type="text/css"?>
<feed xmlns="http://www.w3.org/2005/Atom" xml:lang="en">
	<title>${escapeXml(FEED_TITLE)}</title>
	<link href="${url(FEED_PATH)}" rel="self"/>
	<link href="${url('/blog')}"/>
	<id>${url('/blog')}</id>
	<updated>${escapeXml(updated)}</updated>
	<author>
		<name>${escapeXml(AUTHOR)}</name>
		<uri>${url('/')}</uri>
	</author>
${page}
${entries}
</feed>
`;
}
