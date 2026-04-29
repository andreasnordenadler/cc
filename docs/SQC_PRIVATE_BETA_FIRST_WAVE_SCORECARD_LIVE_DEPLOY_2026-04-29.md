# SQC private-beta first-wave scorecard live deploy — 2026-04-29

## Change

Added a `/beta` first-wave scorecard section so Andreas can log each friend test as comparable evidence instead of loose impressions.

The scorecard captures:

- tester + chess provider coverage
- quest and entry route tested
- pass/fail/pending receipt outcome
- one fairness note and first confusing moment
- whether the run counts as a clean loop toward the two-clean-loop green light

## Why

The `/beta` page already had the invite, script, feedback packet, outcome guidance, green-light criteria, and first tester wave plan. The missing operational bridge was a compact way to record the first 3–5 runs so the next invite wave is based on evidence.

## Files changed

- `src/app/beta/page.tsx`
- `ROADMAP.md`

## Verification

- `pnpm lint` ✅
- `pnpm build` ✅
- production deploy ✅
  - preview: `https://cc-naqvyprul-andreas-nordenadlers-projects.vercel.app`
  - canonical alias: `https://sidequestchess.com`
- live smoke ✅
  - canonical `/beta` returned 200 and contained `First-wave scorecard`, `Track the first friend tests as evidence, not vibes.`, `Copy / paste scorecard`, and `Clean loop? yes / no`
  - preview `/beta` returned 200 and contained `First-wave scorecard` plus `clean loop log`
  - canonical `/account` returned 200
  - canonical `/connect` returned 200

## Notes

A filtered Vercel log scan attempt was skipped after the CLI reported `--since` is unsupported with its default follow mode. Route smoke passed on the deployed production alias.
