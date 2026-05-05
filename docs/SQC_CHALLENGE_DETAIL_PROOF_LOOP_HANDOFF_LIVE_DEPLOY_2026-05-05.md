# SQC challenge-detail proof-loop handoff live deploy — 2026-05-05

## Change
Added a dedicated proof-loop handoff block to every challenge detail route (`/challenges/[id]`) so private-beta testers see the complete loop at the point of accepting a quest:

1. Start the side quest.
2. Play on normal Lichess/Chess.com.
3. Return to the latest receipt and support packet if the result is confusing.

This keeps the quest-detail page aligned with the newer `/today`, `/result`, and `/support` handoffs without adding new beta-admin functionality.

## Files changed
- `src/app/challenges/[id]/page.tsx`

## Verification
- `pnpm lint` ✅
- `pnpm build` ✅
- Production deploy ✅
  - Preview: `https://cc-r3a2yrewe-andreas-nordenadlers-projects.vercel.app`
  - Alias: `https://sidequestchess.com`
- Live smoke ✅
  - `https://cc-r3a2yrewe-andreas-nordenadlers-projects.vercel.app/challenges/knights-before-coffee`
  - `https://sidequestchess.com/challenges/knights-before-coffee`
  - `https://sidequestchess.com/challenges/no-castle-club`
  - `https://sidequestchess.com/result`
  - `https://sidequestchess.com/support`
- Deploy log inspect ✅
  - `vercel inspect https://cc-r3a2yrewe-andreas-nordenadlers-projects.vercel.app --logs` showed `status ● Ready` and successful Next build.

## Notes
- One initial smoke assertion expected signed-in CTA text on a signed-out canonical page; rerun used the correct signed-out `Connect chess identity` assertion and passed.
- `vercel logs --since` is unsupported in this Vercel CLI mode; deploy logs were verified with `vercel inspect --logs` instead.
