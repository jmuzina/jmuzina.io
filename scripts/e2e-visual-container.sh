#!/bin/sh
# Runs inside the Playwright container, started by e2e-visual.sh. Takes the pnpm version, then
# arguments for `playwright test`.
set -e
pnpm_version=$1
shift
cd / && npm install --global --silent "pnpm@$pnpm_version"
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
exit "$status"
