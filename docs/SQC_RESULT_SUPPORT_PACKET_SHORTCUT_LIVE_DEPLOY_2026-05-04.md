# SQC result support packet shortcut — live deploy proof

Date: 2026-05-04 01:18 Europe/Stockholm
Project: CC / Side Quest Chess

## Change

Added a private-beta support shortcut to `/result` so confusing passed/failed/pending receipts have an immediate path to the `/support` packet.

User-visible impact:
- Receipt next-step actions now include `Report confusing receipt`.
- `/result` now includes a `Beta support shortcut` card.
- The card explains the useful report fields: quest, provider, username, game link, and expected result.
- It links back to `/support` and the current quest rules.

## Files changed

- `src/app/result/page.tsx`
- `ROADMAP.md`
- `docs/SQC_RESULT_SUPPORT_PACKET_SHORTCUT_LIVE_DEPLOY_2026-05-04.md`

## Verification

- `pnpm lint` ✅
- `pnpm build` ✅
- Production deploy ✅ `https://cc-eazs5g9bh-andreas-nordenadlers-projects.vercel.app`
- Vercel inspect ✅ status `Ready`, aliases include `https://sidequestchess.com` and `https://www.sidequestchess.com`
- Live smoke ✅
  - Deploy `/result` returns 200 and contains `Report confusing receipt`, `Beta support shortcut`, and `quest, provider, username, game link`
  - Canonical `/result` returns 200 and contains `Report confusing receipt`, `Beta support shortcut`, and `quest, provider, username, game link`
  - Canonical `/support` returns 200 and contains `Copyable support packet`, `Public username:`, and `What I expected instead`
  - Canonical `/` returns 200 and retains the public homepage hero plus `Support`
- Bounded Vercel logs watch ✅ timed out after 20s with no log output emitted
- Vercel 500 scan ✅ `node /Users/sam/.openclaw/workspace/skills/deploy-verify/scripts/vercel-500-scan.mjs --project cc --since 30m` returned `ok: true`, `total: 0`

## Deploy

- Commit pushed to `origin/main` (`Add result support packet shortcut`)
- Production deploy URL: `https://cc-eazs5g9bh-andreas-nordenadlers-projects.vercel.app`
- Canonical URL: `https://sidequestchess.com`
