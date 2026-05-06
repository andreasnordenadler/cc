# SQC sanitize Any Game Counts summary — 2026-05-06

## Scope
Andreas noticed `the Proof Loop Test passed.` still appeared in the completed proof text and asked to rephrase it, plus check punctuation in the last sentence.

## Changes made

- Rephrased new Chess.com/Lichess Any Game Counts verifier summaries from `the Any Game Counts passed.` to `Any Game Counts is complete.`
- Added `sanitizeAttemptSummary` so older saved receipts that still contain `Proof Loop Test` / `the Proof Loop Test passed.` render as user-facing `Any Game Counts is complete.` without requiring metadata migration.
- Updated proof-scroll punctuation from `Proof accepted for <quest>. <summary>` to `Proof accepted: <quest> — <summary>` to avoid a choppy final line.

## Verification

- Grep confirmed no remaining verifier/display source strings for `Proof Loop Test passed` / `Any Game Counts passed`; the only matches are the sanitizer compatibility patterns for old saved receipts.
- `pnpm lint` passed with only existing accepted warnings.
- `pnpm build` passed.
