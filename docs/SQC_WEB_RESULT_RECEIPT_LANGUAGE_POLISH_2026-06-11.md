# SQC Web Result Receipt Language Polish — 2026-06-11

## Sprint slice

Continued the 24h SQC website UX parity review with the signed-in `/result` proof receipt surface.

## User-facing changes

- Removed internal/product-review phrasing from the result receipt helper panels.
- Reframed passed, pending, and failed receipt next steps in player-facing SQC language.
- Clarified that passed receipts are ready to share, pending receipts need one more eligible public game, and failed receipts should guide the next run.
- Replaced a duplicate `Browse quests` CTA with distinct `Browse Solo Side Quests` and `Find Multiplayer tables` next steps.
- Preserved existing proof decoding, result status logic, public proof links, share actions, and verifier behavior.

## Checks

- `pnpm lint -- src/app/result/page.tsx`
- `pnpm build`

## Deployment / smoke

- Pending commit/deploy for this slice.
