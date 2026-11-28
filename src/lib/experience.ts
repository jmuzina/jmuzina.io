import type { Snippet } from 'svelte';

export type Job = {
	company: string;
	title: string;
	location: string;
	websiteUrl?: string;
	startDate: Date;
	endDate?: Date;
	description: string | Snippet;
};

export type Education = {
	institution: string;
	location: string;
	websiteUrl?: string;
	program: string;
	startDate: Date;
	endDate?: Date;
	grade: string;
	honors?: string;
};

export const jobs: Job[] = [
	{
		company: 'Canonical',
		title: 'Software Engineer',
		websiteUrl: 'https://canonical.com',
		location: 'Remote',
		startDate: new Date('2024-04-26'),
		description:
			'Architecting a new internal platform and contributing to department-wide initiatives in accessibility and developer experience.'
	},
	{
		company: 'Brooksource',
		title: 'Software Developer',
		websiteUrl: 'https://brooksource.com/',
		location: 'Cleveland, Ohio',
		startDate: new Date('2023-11-20'),
		endDate: new Date('2024-04-23'),
		description:
			'Modernized and enhanced product inventory web applications used by <a href="https://www.sherwin-williams.com/" rel="noopener" target="_blank">Sherwin-Williams</a>\' global sales force.'
	},
	{
		company: 'Comsat Architects',
		title: 'Software Developer',
		websiteUrl: 'https://comsat-architects.com/',
		location: 'Rocky River, Ohio',
		startDate: new Date('2022-07-20'),
		endDate: new Date('2023-11-17'),
		description:
			'Developed mission planning and data visualization\n' +
			'applications for <a href="https://nasa.gov" rel="noopener" target="_blank">NASA</a>.'
	},
	{
		company: 'Medical Mutual',
		title: 'ETL Developer Intern',
		websiteUrl: 'https://www.medmutual.com/',
		location: 'Brooklyn, Ohio',
		startDate: new Date('2022-05-26'),
		endDate: new Date('2022-07-12'),
		description: 'Extracted business intelligence to provide insights to business analysts.'
	},
	{
		company: 'Reworld',
		title: 'Game Developer Intern',
		location: 'Remote',
		startDate: new Date('2020-11-01'),
		endDate: new Date('2022-07-20'),
		description:
			'Developed 2 multiplayer games built on an experimental engine. Provided Lua lectures, programming advice, and answered technical questions for newer game developer interns.'
	},
	{
		company: 'Kent State University',
		title: 'Research Assistant',
		websiteUrl: 'https://www.kent.edu/cs',
		location: 'Kent, Ohio',
		startDate: new Date('2020-04-01'),
		endDate: new Date('2020-09-20'),
		description: 'Analyzed & reported on efficacy of distributed network consensus algorithms.'
	}
].sort((a, b) => b.startDate.getTime() - a.startDate.getTime());

export const educations: Education[] = [
	{
		institution: 'Kent State University',
		location: 'Kent, Ohio',
		websiteUrl: 'https://kent.edu',
		program: 'B.S, Computer Science',
		startDate: new Date('2018-08-01'),
		endDate: new Date('2022-05-26'),
		grade: '3.868',
		honors: 'Magna Cum Laude'
	}
].sort((a, b) => b.startDate.getTime() - a.startDate.getTime());

export function getCurrentJob(list: Job[]): Job {
	const current = list.filter((job) => !job.endDate);
	// The home page and the Experience description name the current role in prose, so with none
	// (or two) their copy needs rewriting, not just this list.
	if (current.length !== 1) {
		throw new Error(`Expected exactly one job without an end date, found ${current.length}.`);
	}
	return current[0];
}

export const currentJob = getCurrentJob(jobs);

// Lowercased to sit mid-sentence, so a title with an acronym (or one that takes "an") needs the
// copy that uses this checked.
export const currentRole = `${currentJob.title.toLowerCase()} at ${currentJob.company}`;
