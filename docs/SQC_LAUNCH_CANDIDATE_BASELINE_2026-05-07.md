# Side Quest Chess Launch Candidate Baseline — 2026-05-07

## Status

Andreas confirmed on 2026-05-07 at ~20:38 Europe/Stockholm:

> “I am happy now with as-is.”

This marks the current Side Quest Chess production state as the **Launch Candidate** baseline.

## Baseline identity

- Product: **Side Quest Chess**
- Canonical production URL: `https://sidequestchess.com`
- Repo: `andreasnordenadler/cc`
- Branch: `main`
- Baseline commit: `2a27d05` (`Remove homepage proof scroll backdrop`)
- Latest production deployment observed before this note: `https://cc-fw281cjs3-andreas-nordenadlers-projects.vercel.app`, aliased to `https://sidequestchess.com`

## What this baseline includes

This launch candidate includes the current polished SQC web experience:

- Signed-out homepage with lean nav and `Sign In/Up` auth CTA.
- Quest Hub and individual quest pages considered launch-ready by Andreas.
- `Any Game Counts` proof-loop test quest.
- Activation-window guard so restarted quests require new post-activation proof.
- Browser-local proof/status times.
- Generated 1200×1600 victory proof PNGs.
- Cached generated proof images.
- Completed quest reset/repeat loop.
- My Side Quests account page with current quest, connected accounts, stats, proof receipts, and awkward trophy cabinet.
- Completed quest proof actions replacing stale checker UI.
- Social proof sharing controls for X, Facebook, Instagram helper, Reddit, WhatsApp, Telegram, and LinkedIn.
- Copy proof link, copy image link, and download image fallbacks.
- Top nav reduced to Home, Side Quests, Coat of Arms, and account/auth.
- Footer includes `sidequestchess.com anno 2026`, Support, and Terms & Conditions with divider.
- Visible Coming Soon quests limited to four, with dated weekly release queue.
- Launch Candidate 1 hardening: state-aware CTAs, sign-in/connect reassurance copy, support/legal hygiene, and beta-copy cleanup.
- External product review updated with current logged-in/authenticated launch-candidate status.

## Verification evidence already completed for this candidate

Recent verification around this baseline included:

- `pnpm lint` passed with known warnings only.
- `pnpm build` passed.
- Guarded production deploys passed via `pnpm deploy:prod`.
- Production smoke checks returned 200 for key routes including `/`, `/challenges`, `/challenges/finish-any-game`, `/result`, `/account`, `/support`, and `/terms` across recent runs.
- Authenticated production E2E completed with SAM/samnordbot account:
  - signed in to `/account`;
  - connected usernames present/restored;
  - started `Any Game Counts`;
  - confirmed pre-activation game did not complete the quest;
  - completed with a post-activation public Lichess game;
  - generated proof PNG route opened as `1200×1600 image/png`;
  - reset quest worked;
  - repeat start/verify/completion worked;
  - Vercel production error logs showed no recent errors.

## Baseline rule

Treat this commit and production state as the current SQC web launch candidate. Future changes should be deliberate launch-candidate deltas and should keep this baseline easy to identify for rollback/comparison.
