# SQC Web Public Player Language Polish — 2026-06-10

## Scope
Continued the 24h website UX parity review by tightening visible Community Solo, Custom Solo, and Support copy around public player context and private rule data.

## Changes
- `/challenges/community`: replaced awkward `player shelf` wording with clearer public-player filter language and `More from player` actions.
- `/challenges/community/[id]`: renamed the player-context card to `More from this player`, changed `Safe rule summary` to `Public rule summary`, and replaced internal-feeling `Account handoff` copy with `Start from account`.
- `/account/custom-side-quests`: replaced visible `raw config` phrasing with player-facing private rule data language.
- `/support`: changed signed-out support diagnostics copy from `raw custom quest configs` to private custom quest rules.

## Safety / boundaries
- Copy-only UX polish; no verifier, lifecycle, publishing, privacy, support-thread, analytics, or release behavior changed.
- Private drafts, archived quests, custom rule internals, account metadata, and invite details remain hidden.

## Verification
- `grep -RInE "raw config|raw custom|account handoff|Player shelf|player shelf|Safe rule|website creator|Website creator|website-first|Website-first|web-first|mobile app|web view|mobile flow|switch to mobile|recipe" src/app src/components src/lib` → only an admin-only mobile support label remains.
- `pnpm lint -- src/app/account/custom-side-quests/page.tsx src/app/challenges/community/page.tsx 'src/app/challenges/community/[id]/page.tsx' src/components/support-contact-form.tsx`
- `pnpm build`
- `pnpm deploy:prod` including `pnpm quest:release-gate`
- Production deploy: `https://cc-9ny9222ww-andreas-nordenadlers-projects.vercel.app` aliased to `https://sidequestchess.com`
- Live smoke: production `/challenges/community?playerLanguageSmoke=20260610` and seeded Community Solo detail returned 200 with `More from player`, `More from this player`, `Public rule summary`, and `Start from account`; old `player shelf` / `raw config` / `Account handoff` / `Safe rule summary` / `recipe` language was absent from smoked public pages. Signed-out `/account/custom-side-quests?playerLanguageSmoke=20260610` returned the expected 307 sign-in protection.
