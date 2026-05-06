# SQC Great Version Baseline — 2026-05-06

## Baseline label

**Great version / happy logged-in homepage + Coat of Arms usability baseline**

Andreas explicitly approved this state after the logged-in homepage polish pass and the Coat of Arms full-card clickability pass:

> “Very very good! Well done! Let us document this version of the whole project as a great version. Then we work on some tweaks from here”

## Canonical production surface

- Canonical domain: `https://sidequestchess.com`
- Latest verified deployment: `https://cc-mmqxzr8nd-andreas-nordenadlers-projects.vercel.app`
- Vercel deployment id: `dpl_9g2zrNZive4swm93jS9PSy6ApUj4`
- Vercel status at checkpoint: `Ready`
- Code baseline commit: `c479b8d` — `Make coat of arms cards clickable`

## What makes this version good

### Logged-in homepage baseline

The signed-in home page is now the approved baseline:

- Hero is quiet and focused: primary action is `Browse quests` only.
- Removed earlier clutter: random quest CTA, connect-account CTA, green helper line, proof-loop panel.
- Active Quest card is the main logged-in status surface.
- Active Quest card:
  - uses the label `Active Quest`;
  - shows the active quest coat of arms;
  - removes completed-quest count and points pill;
  - removes secondary `Review active rules` button;
  - is fully clickable and routes to the active quest page;
  - uses a two-column layout so text and coat of arms both breathe.
- `How heroic are you feeling today?` cards show green outline + `ACTIVE QUEST` stamp when one is active.
- Homepage badge row shows green outline + `ACTIVE QUEST` stamp when one is active.
- Signed-out homepage was intentionally kept separate and should not inherit these logged-in removals unless Andreas asks.

### My Quest Log / account surface baseline

- Locked coat-of-arms shelf no longer has the missile-like blur/ring artifact.
- Locked crests are centered/aligned in their slots.
- My Quest Log remains the place for account connections, proof checks, receipts, and progress detail.

### Coat of Arms page baseline

- Coat of Arms page remains a visual/reference gallery.
- Every quest card on `/badges` is now fully clickable, not just the coat image.
- Hover/focus state applies to the whole card so the interaction target feels intentional.

## Verification at checkpoint

Commands/checks run during the final pass:

- `pnpm lint` — passed with existing warnings only:
  - `scripts/deploy-production-guard.mjs` unused `envOutput`
  - `src/components/site-nav.tsx` `<img>` optimization warning
- `pnpm build` — passed
- Production deploy guard — passed
- Vercel production deploy — passed and aliased to `https://sidequestchess.com`
- Live smoke checks:
  - `https://sidequestchess.com/` → `200`
  - `https://sidequestchess.com/badges` → `200`
  - `https://sidequestchess.com/account` → `200`
  - `https://sidequestchess.com/challenges` → `200`
- Tracked git tree was clean before creating this baseline document.

## Baseline preservation rule

Use this state as the reference point for near-term tweaks. If a future tweak makes the product feel worse, compare against this document and the code baseline commit `c479b8d`.
