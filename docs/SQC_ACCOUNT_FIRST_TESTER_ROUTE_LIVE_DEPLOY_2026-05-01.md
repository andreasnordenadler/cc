# SQC account first tester route — live deploy proof

Date: 2026-05-01
Owner: Sam

## Change

Added a dedicated **First tester route** block to `/account` so private-beta testers can start from three recommended dares instead of choosing from the full ten-quest deck cold:

1. `Knights Before Coffee`
2. `No Castle Club`
3. `Queen? Never Heard of Her`

The block keeps existing auth and challenge-start behavior: signed-in users can make a recommended quest active directly from `/account`; signed-out visitors can preview rules.

## Local verification

- `pnpm lint` ✅
- `pnpm build` ✅

## Live verification

- Production deploy: `https://cc-9qhj5qpfl-andreas-nordenadlers-projects.vercel.app` ✅
- Alias: `https://sidequestchess.com` ✅
- Smoke checks:
  - Final merged deploy `/account` returned HTTP 200 and contained `First tester route`, `Start with three dares`, `Knights Before Coffee`, `No Castle Club`, and `Queen? Never Heard of Her` ✅
  - Canonical `/account` returned HTTP 200 and contained `First tester route`, `Start with three dares`, and `choice-saver` ✅
  - Canonical `/challenges` returned HTTP 200 and retained the existing `Private beta starter route` strings ✅
  - Canonical `/result` returned HTTP 200 and retained receipt/check/challenge copy ✅
- Canonical `/support` returned HTTP 200 after the merged redeploy, confirming newer remote support/privacy route work stayed live ✅
- Canonical `/challenges/knights-before-coffee` returned HTTP 200 and retained the newer `Before you start` proof-contract copy after the merged redeploy ✅
- Vercel error logs: `vercel logs https://cc-9qhj5qpfl-andreas-nordenadlers-projects.vercel.app --no-follow --level error --since 10m` found no logs ✅

## Commit

- `Add account beta starter route`
