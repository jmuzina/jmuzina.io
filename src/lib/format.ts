export const formatPostDate = (iso: string) =>
	new Date(iso).toLocaleDateString('en-US', {
		// frontmatter dates are midnight UTC; don't let the build machine's zone shift the day
		timeZone: 'UTC',
		month: 'short',
		day: 'numeric',
		year: 'numeric'
	});
