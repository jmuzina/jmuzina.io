import { afterEach, describe, expect, it } from 'vitest';
import { formatPostDate } from './format';

describe('formatPostDate', () => {
	const originalTimeZone = process.env.TZ;
	afterEach(() => {
		process.env.TZ = originalTimeZone;
	});

	// CI runs in UTC, where a zone bug is invisible; force a zone behind UTC so midnight UTC
	// would fall on the previous day if the date were formatted in local time.
	it('shows the frontmatter date regardless of the machine time zone', () => {
		process.env.TZ = 'America/New_York';
		expect(formatPostDate('2026-03-02T00:00:00.000Z')).toBe('Mar 2, 2026');
	});
});
