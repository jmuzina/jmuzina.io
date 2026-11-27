import { markdownPath } from './page-markdown';
import type { Post } from './posts';
import { AUTHOR } from './seo';

// The home page's meta description, so this adds no copy of its own. e2e/seo.spec.ts keeps them
// in sync.
export const SITE_SUMMARY =
	"Julie Mužina's personal site. Trying to make sense of things, and to make them a little better.";

export type LlmsPage = { path: string; label: string };

const linkText = (text: string) => text.replace(/[\\[\]]/g, '\\$&');
const oneLine = (text: string) => text.replace(/\s+/g, ' ').trim();

// The llms.txt format (https://llmstxt.org): a Markdown index of the site for language models.
export function buildLlmsTxt(origin: string, pages: LlmsPage[], posts: Post[]): string {
	// to the Markdown copies, which the format asks for
	const link = (label: string, path: string) =>
		`- [${linkText(label)}](${new URL(markdownPath(path), origin).href})`;

	const sections = [
		`# ${AUTHOR}`,
		`> ${SITE_SUMMARY}`,
		['## Pages', ...pages.map((page) => link(page.label, page.path))].join('\n')
	];
	if (posts.length) {
		sections.push(
			[
				'## Blog',
				...posts.map((post) => `${link(post.title, post.path)}: ${oneLine(post.description)}`)
			].join('\n')
		);
	}
	return sections.join('\n\n') + '\n';
}
