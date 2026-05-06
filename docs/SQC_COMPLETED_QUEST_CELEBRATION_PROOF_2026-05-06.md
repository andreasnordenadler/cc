# SQC completed quest celebration proof — 2026-05-06

## User direction

Andreas agreed that completed quests should feel more special, especially that the unlocked coat of arms should be prominent and shareable together with the proof.

## Change

Updated `/result` passed-state UX so a completed quest reads as a victory moment instead of a dry receipt:

- Passed status now says `Quest completed`.
- Hero headline becomes `Quest completed. Coat of arms unlocked.`
- Result poster gets a `Quest complete` stamp.
- Unlocked coat of arms is staged larger in the proof poster.
- Completion copy explicitly frames the verifier proof + unlocked coat of arms together.
- Passed-state sidebar becomes `Shareable celebration` and says the coat of arms is the headline.
- Share card becomes `Share the unlock`, repeats the unlocked coat artwork, and uses `Copy victory proof` / `Share victory proof` actions.
- Share text now includes quest title, coat-of-arms name, badge mark, reward points, and notes that proof + coat of arms are included.

## Verification

- `pnpm lint` passed with existing warnings only.
- `pnpm build` passed.
