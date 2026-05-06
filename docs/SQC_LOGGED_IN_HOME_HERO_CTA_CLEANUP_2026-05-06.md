# SQC logged-in homepage hero CTA cleanup — 2026-05-06

## User request

Andreas sent a logged-in homepage screenshot and asked to remove:

- the green `Pick → play → prove. One quest at a time.` line;
- the `Connect account` button;
- the `Random quest` button.

## Change

Updated `src/app/page.tsx` so the logged-in hero keeps only the primary `Browse quests` action. Signed-out auth actions are unchanged.

## Verification

- `pnpm lint` passed with existing warnings only.
- `pnpm build` passed.

## Deployment status

Pending production deploy at time of writing.
