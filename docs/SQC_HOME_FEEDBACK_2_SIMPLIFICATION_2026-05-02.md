# SQC homepage feedback 2 simplification — 2026-05-02

## Source

Andreas pointed to `~/Downloads/Feedback 2.docx`, a second pass of homepage feedback.

## Feedback themes applied

- Logo made the top area too thick; maybe no logo is needed there.
- Black top bar felt too hard and not aligned with the rest of the site theme.
- Hero had three buttons plus a three-step block, which felt redundant/confusing.
- Still too many boxes inside boxes.
- The single beginner quest card left awkward unused space; suggested 2–3 recommended quests or Today’s quest instead.
- Quest text was funny/weird and should be kept, but naming/context should be clearer.
- Current active quest/status can be useful, but should be quieter.

## Change

- Removed the large logo from the homepage hero.
- Replaced the logo-heavy nav brand with a compact text `SQC` mark.
- Softened the top nav background/border so it feels less like a hard black bar.
- Reduced hero CTAs from three to two and replaced the three numbered boxes with a single plain loop line: `Pick → play → prove`.
- Replaced the oversized recommended quest card/badge panel with a clean list of three recommended first quests plus a Today link.
- Removed the signed-out “first run” card to reduce duplicate onboarding boxes.
- Kept signed-in current-run status, but made it more compact and quieter.
- Reduced secondary homepage cards to Badges and Trust only.

## Verification

- `pnpm install --frozen-lockfile` passed.
- `pnpm lint` passed.
- `pnpm build` passed.
- Production deploy completed: `https://cc-9xcae5qew-andreas-nordenadlers-projects.vercel.app` aliased to `https://sidequestchess.com`.
- Live smoke passed for `/`, `/challenges`, `/today`, and `/support`.
- Homepage HTML confirms `SQC`, `Pick → play → prove`, `Recommended first quests`, `Knights Before Coffee`, and `No PGN uploads`; it no longer contains the hero logo image markup.
