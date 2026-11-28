import { describe, expect, it } from 'vitest';
import { getCurrentJob, type Job } from './experience';

const job = (company: string, endDate?: Date): Job => ({
	company,
	title: 'Engineer',
	location: 'Remote',
	startDate: new Date('2020-01-01'),
	endDate,
	description: ''
});

describe('getCurrentJob', () => {
	it('is the job with no end date', () => {
		expect(getCurrentJob([job('Old', new Date('2021-01-01')), job('Now')]).company).toBe('Now');
	});

	it.each([
		['none', [job('Old', new Date('2021-01-01'))]],
		['two', [job('One'), job('Two')]]
	])('fails the build with %s', (_, list) => {
		expect(() => getCurrentJob(list)).toThrow('Expected exactly one job without an end date');
	});
});
