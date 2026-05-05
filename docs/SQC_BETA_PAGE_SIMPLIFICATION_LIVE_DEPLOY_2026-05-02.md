# SQC Beta Page Simplification — Live Deploy Proof

Date: 2026-05-02 02:44 Europe/Stockholm
Project: CC / Side Quest Chess
Commit: `Simplify SQC beta page` (final hash recorded by git)

## Change

Simplified `/beta` after Andreas clarified that no more beta-tester functionality is needed and the beta tester side is good as-is.

- Removed the extra tester-script, feedback-template, friend-invite, scorecard, wave-planning, and Sam-run beta pass blocks from `/beta`.
- Kept the useful private-beta orientation: launch posture, three-step checklist, and trust basics.
- Corrected the remaining `/beta` verifier copy back to the current full ten-quest Lichess + Chess.com dual-host deck.
- Preserved newer launch-readiness/support-route work from `origin/main` before the final deploy.
- Recorded the beta-tester-functionality canon in `ROADMAP.md` so future autonomous bursts avoid rebuilding beta admin/reporting surfaces by default.

## Local verification

- `pnpm install --frozen-lockfile` ✅
- `pnpm lint` ✅
- `pnpm build` ✅
- Rebased onto `origin/main`, then re-ran `pnpm lint` ✅ and `pnpm build` ✅

## Deployment

- `vercel --prod --yes` ✅
- Production deploy URL: `https://cc-q75npk7y3-andreas-nordenadlers-projects.vercel.app`
- Canonical alias: `https://sidequestchess.com`

## Live smoke

- Deploy `/beta`: HTTP 200 ✅
- Canonical `/beta`: HTTP 200 ✅
- Canonical `/account`: HTTP 200 ✅
- Canonical `/challenges`: HTTP 200 ✅
- Canonical `/support`: HTTP 200 ✅
- `/beta` contains required strings: `full dual-host deck`, `All ten current starter-deck quests`, `Trust basics`, `no password sharing` ✅
- `/beta` no longer contains removed beta-admin/reporting strings: `5-minute tester script`, `Feedback packet`, `First-wave scorecard`, `Sam-run beta pass` ✅
- Vercel production error log scan: `vercel logs --environment production --level error --since 10m --no-follow --no-branch --limit 20` → no logs found ✅
