# SQC Proof Loop Test coat of arms — 2026-05-06

## User request

Andreas asked for a proper coat of arms for the new `Proof Loop Test` quest.

## Change

Generated and wired a production badge asset for the quest:

- Asset: `public/badges/v6/proof-loop-test-badge.png`
- Quest: `finish-any-game` / `Proof Loop Test`
- Badge name: `The Rubber Stamp Rampart`
- Visual direction: emerald/gold heraldic chess crest with proof/checkmark/rubber-stamp motif, designed to read as a premium but slightly funny SQC test-loop achievement.

The quest now uses the proper illustrated badge instead of the fallback motif token.

## Verification

- `pnpm lint` passed with existing warnings only.
- `pnpm build` passed.
- Production smoke should confirm `/challenges/finish-any-game`, `/badges`, and `/account` after deploy.
