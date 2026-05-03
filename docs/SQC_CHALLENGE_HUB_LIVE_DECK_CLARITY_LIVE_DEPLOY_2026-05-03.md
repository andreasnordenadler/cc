# SQC Challenge Hub Live Deck Clarity — Live Deploy

Date: 2026-05-03 19:50 Europe/Stockholm
Project: CC / Side Quest Chess

## Change

Tightened `/challenges` private-beta clarity:

- Replaced the fake/static `Most failed` status card with a real live-backed verifier count: `10/10 quests`.
- Added a visible `Full deck proof is live.` note in the recommended starter route.
- Clarified that the recommended three-quest route lowers first-run choice pressure, not verifier coverage uncertainty.

## Files changed

- `src/app/challenges/page.tsx`

## Verification

Local:

- `pnpm install --frozen-lockfile` ✅
- `pnpm lint` ✅
- `pnpm build` ✅

Production deploy:

- `vercel --prod --yes` ✅
- Deploy URL: `https://cc-hhintuj43-andreas-nordenadlers-projects.vercel.app`
- Canonical alias: `https://sidequestchess.com`

Live smoke:

- Deploy `/challenges` returned 200 and contained `Live-backed deck`, `10/10 quests`, `Full deck proof is live.`, and the dual-host proof explanation ✅
- Canonical `/challenges` returned 200 and contained the same strings ✅
- Confirmed stale `Most failed` copy is absent on deploy and canonical `/challenges` ✅
- Deploy + canonical `/account` returned 200 ✅
- Deploy + canonical `/beta` returned 200 ✅
- Vercel 500 scan for project `cc` over 30m: `0` ✅

## Impact

The challenge hub is more honest and clearer for private-beta testers: it now surfaces full dual-host starter-deck proof coverage directly where first-time users choose quests, without implying the three-quest starter route exists because the rest of the deck is not ready.
