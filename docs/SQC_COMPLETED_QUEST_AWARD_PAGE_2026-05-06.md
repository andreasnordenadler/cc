# SQC completed quest award page — 2026-05-06

## Scope
Andreas asked to improve the completed quest page at `/challenges/finish-any-game`:

- make the completion stamp much more prominent
- optionally use a custom generated graphic
- remove the buttons from the completed quest presentation
- add the completion date using the actual game time where available

## Changes made

- Generated a custom celebratory chess seal graphic and saved it as `public/stamps/quest-complete-seal.png`.
- Replaced the small completed stamp on quest detail pages with a large award-style seal overlay and text: `Quest completed`.
- Added a completion-date line to the award: `Game completed <date>`.
- Added `completedGameAt` to saved challenge attempts.
- Lichess verifiers now populate `completedGameAt` from `lastMoveAt` / `createdAt` when proof passes.
- Chess.com verifiers now populate `completedGameAt` from `end_time` when proof passes.
- Removed the completed-state hero action buttons (`Share this Quest`, `Victory proof`, `Proof log`).
- Removed the completed active status-panel buttons.
- Hid the friend-dare button section on completed quest pages so the page reads more like an award/proof state than a task page.

## Notes

- Historical proof receipts may fall back to the proof-recorded time if they were created before `completedGameAt` existed.
- New verifier passes should store the actual provider game completion time when available.

## Verification

- `pnpm lint` passed with only existing accepted warnings.
- `pnpm build` passed.
