# SQC Any Game Counts evidence punctuation and seal position — 2026-05-06

## Scope
Andreas pointed out the victory scroll/evidence text still showed `are accepted for` without a satisfying ending, and asked to move the seal higher so it sits in the middle of the empty space below the text.

## Changes made

- Rephrased Any Game Counts evidence text from `Win, loss, draw, color, and time control are accepted for this test quest.` to `Win, loss, draw, color, and time control all count.`
- Added render-time sanitizer replacements for older saved receipts containing the previous wording or a truncated `are accepted for` phrase.
- Moved the proof-scroll wax seal upward by increasing its bottom offset.

## Verification

- Grep confirmed the only remaining `are accepted for` matches are sanitizer compatibility patterns for old saved receipts; verifier/display copy now uses `all count.`
- `pnpm lint` passed with only existing accepted warnings.
- `pnpm build` passed.
