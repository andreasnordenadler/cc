# SQC Web Solo Discovery Lanes — 2026-06-10

## Slice

Closed a website discovery parity gap versus mobile-v251: the mobile home screen had backend-driven Solo discovery choices, a random Solo Side Quest shortcut, and a quick proof loop lane, while `/challenges` only exposed the full deck plus older static sections.

## Shipped

- Added mobile-matching `How heroic are you feeling today?` choices to `/challenges` using the same labels/copy/targets as mobile bootstrap discovery.
- Added a website `Surprise me with a random Solo Side Quest` control that avoids the active/completed quest where possible and falls back to the live official pool.
- Aligned the official recommended starting path with the mobile `Recommended starting path` group.
- Added a `Quick proof loop` lane for fast pick/play/prove/receipt testing.

## Constraints

- Preserved the existing website look and feel: mission cards, buttons, and challenge cards only.
- No quest release changes, verifier changes, marketing actions, or production data mutations.

## Verification

- `pnpm lint -- src/app/challenges/page.tsx src/components/random-solo-quest-link.tsx`
- `pnpm build`
