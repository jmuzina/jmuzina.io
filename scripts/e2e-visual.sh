#!/bin/sh
# Runs the visual tests in the Playwright image CI uses, so screenshots taken here match CI's.
# Extra arguments go to `playwright test`, e.g. --update-snapshots.
set -e

version=$(node -p "require('@playwright/test/package.json').version")
pnpm_version=$(node -p "require('./package.json').packageManager.split('@')[1].split('+')[0]")
snapshots=e2e/visual.spec.ts-snapshots
mkdir -p "$snapshots" playwright-report test-results

# amd64 because CI runners are, and Chromium renders some pixels differently on arm64.
# The build and tests run on a copy inside the container: parallel writes to a Docker Desktop
# bind mount fail with EEXIST and ENOTDIR. Only the baselines, the report and test-results
# (failure diffs and traces) come back. Without Docker Desktop, the copy would be owned by root
# and `pnpm test:e2e` could no longer clear test-results, so it goes to the host user.
docker run --rm --ipc=host --platform linux/amd64 \
	-e HOST_UID="$(id -u)" -e HOST_GID="$(id -g)" \
	-v "$PWD":/host:ro \
	-v "$PWD/$snapshots":/out/snapshots \
	-v "$PWD/playwright-report":/out/report \
	-v "$PWD/test-results":/out/test-results \
	-v jmuzina-io-pnpm:/root/.local/share/pnpm \
	"mcr.microsoft.com/playwright:v$version-noble" \
	sh -c '
		set -e
		cd / && npm install --global --silent "pnpm@$0"
		mkdir /work && cd /work
		tar -C /host -c --exclude=./.git --exclude=./node_modules --exclude=./build \
			--exclude=./.svelte-kit --exclude=./test-results --exclude=./playwright-report . | tar -x
		pnpm install --frozen-lockfile
		status=0
		pnpm exec playwright test --config playwright.visual.config.ts "$@" || status=$?
		cp -R e2e/visual.spec.ts-snapshots/. /out/snapshots/
		rm -rf /out/report/* && cp -R playwright-report/. /out/report/
		rm -rf /out/test-results/* && cp -R test-results/. /out/test-results/
		chown -R "$HOST_UID:$HOST_GID" /out/test-results
		exit $status
	' "$pnpm_version" "$@"
