#!/bin/sh
set -eu
cd /Users/sam/.openclaw/workspace/cc
stamp=$(date -u +%Y%m%dT%H%M%SZ)
short=$(date -u +%d%H%M%SZ | tr '[:upper:]' '[:lower:]')
outdir="tmp/account-setting-mutation-round-trip-repeatability-streak-extension-plus-fifty-seven-smoke-${stamp}"
username="and72norcc${short}"
printf '%s\n%s\n' "$outdir" "$username" > /tmp/cc_plus57_run_meta.txt
python3 tmp/run_account_round_trip_smoke.py "$outdir" "$username"
python3 tmp/verify_account_round_trip_smoke.py "$outdir"
printf '%s\n' "$outdir"
