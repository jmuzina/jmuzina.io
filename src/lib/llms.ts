import { markdownPath } from './page-markdown';
import type { Post } from './posts';
import { routes } from './routes';
import { AUTHOR } from './seo';

export type LlmsPage = { path: string; label: string; description: string };

const linkText = (text: string) => text.replace(/[\\[\]]/g, '\\$&');
const oneLine = (text: string) => text.replace(/\s+/g, ' ').trim();

// The llms.txt format (https://llmstxt.org): a Markdown index of the site for language models.
export function buildLlmsTxt(origin: string, pages: LlmsPage[], posts: Post[]): string {
	// to the Markdown copies, which the format asks for
	const link = (label: string, path: string) =>
		`- [${linkText(label)}](${new URL(markdownPath(path), origin).href})`;

	const sections = [
		`# ${AUTHOR}`,
		`> ${routes['/'].description}`,
		[
			'## Pages',
			...pages.map((page) => `${link(page.label, page.path)}: ${oneLine(page.description)}`)
		].join('\n')
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
