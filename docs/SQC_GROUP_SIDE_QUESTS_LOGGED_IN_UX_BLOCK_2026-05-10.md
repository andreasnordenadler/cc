# Group Side Quests logged-in UX/UI block — 2026-05-10

## Scope

Andreas asked for a focused logged-in Group Side Quest UX/UI block covering participating, creating, and maintaining Group Side Quests.

## Shipped increment

- `/groupquests` logged-in overview now reads as a dashboard instead of static rows:
  - current/needs-action/invite summary stats
  - next-best-action CTA for live proof
  - clearer current vs previous Group Side Quests
  - quick actions for create, continue, and join-by-invite flow
  - join-with-invite explanation that emphasizes rule review before proof counts
- `/groupquests/create` now has a launch-facing staged create flow:
  - checklist for basics, invites, locked rules, and maintenance preview
  - active `Group Side Quests` nav state
  - no visible hidden/prototype copy
- `GroupQuestDraftBuilder` now makes the creator flow more explicit:
  - stage rail (Basics, Invites, Rules, Preview)
  - participant preview language
  - share-link summary
  - host maintenance preview for invite pause, proof review, and final standings
- `/groupquests/gq_demo_no_castle_01` detail page now separates participant and host concerns:
  - participant proof-status checklist
  - submit-proof CTA anchor
  - host maintenance controls
  - proof-backed leaderboard with proof states
  - activity feed labels that explain state changes
  - active `Group Side Quests` nav state

## Verification

- `pnpm lint` passed with 3 existing warnings:
  - `scripts/deploy-production-guard.mjs` unused `envOutput`
  - `<img>` warnings in `src/components/proof-image.tsx` and `src/components/site-nav.tsx`
- `pnpm build` passed and built `/groupquests`, `/groupquests/create`, and `/groupquests/gq_demo_no_castle_01`.
- Production deploy guard passed.
- Production deploy `https://cc-96x3cukfs-andreas-nordenadlers-projects.vercel.app` was aliased to `https://sidequestchess.com`.
- Live smoke via Python `urllib.request` confirmed `/groupquests`, `/groupquests/create`, and `/groupquests/gq_demo_no_castle_01` return 200 with expected launch copy.

## Notes

User-facing terminology uses **Group Side Quest(s)**. `room` remains only in internal type/class/function names where already established.
