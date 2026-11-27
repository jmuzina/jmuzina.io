#!/bin/sh
# Runs the visual tests in the Playwright image CI uses, so screenshots taken here match CI's.
# Extra arguments go to `playwright test`, e.g. --update-snapshots.
set -e

version=$(node -p "require('@playwright/test/package.json').version")
pnpm_version=$(node -p "require('./package.json').packageManager.split('@')[1].split('+')[0]")
snapshots=e2e/visual.spec.ts-snapshots
mkdir -p "$snapshots" playwright-report

# amd64 because CI runners are, and Chromium renders some pixels differently on arm64.
# The build and tests run on a copy inside the container: parallel writes to a Docker Desktop
# bind mount fail with EEXIST and ENOTDIR. Only the baselines and the report come back.
docker run --rm --ipc=host --platform linux/amd64 \
	-v "$PWD":/host:ro \
	-v "$PWD/$snapshots":/out/snapshots \
	-v "$PWD/playwright-report":/out/report \
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
		exit $status
	' "$pnpm_version" "$@"
