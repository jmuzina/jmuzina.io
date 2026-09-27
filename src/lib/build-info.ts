declare const __COMMIT_SHA__: string | undefined;
declare const __COMMIT_DATE__: string | undefined;

export const commitSha: string = typeof __COMMIT_SHA__ !== 'undefined' ? __COMMIT_SHA__ : '';
export const commitDate: string = typeof __COMMIT_DATE__ !== 'undefined' ? __COMMIT_DATE__ : '';
export const shortSha: string = commitSha ? commitSha.slice(0, 7) : '';
export const githubRepoUrl = 'https://github.com/jmuzina/jmuzina.io';
