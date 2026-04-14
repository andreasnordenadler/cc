#!/bin/sh
set -eu
cd /Users/sam/.openclaw/workspace/cc
stamp=$(date -u +%Y%m%dT%H%M%SZ)
short=$(date -u +%d%H%M%SZ)
outdir="tmp/account-setting-mutation-round-trip-repeatability-streak-extension-plus-thirty-eight-smoke-${stamp}"
username="and72norcc${short}"
printf '%s\n%s\n' "$outdir" "$username" > /tmp/cc_plus38_run_meta.txt
exec python3 tmp/run_account_round_trip_smoke.py "$outdir" "$username"
