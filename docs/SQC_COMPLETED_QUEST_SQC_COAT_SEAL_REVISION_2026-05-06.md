# SQC completed quest seal revision — 2026-05-06

## Scope
Andreas corrected the first generated completion seal: the idea was good, but the asset should be a stamp/seal closer to the provided references and should use the actual SQC coat of arms.

## Changes made

- Replaced the generic generated seal asset with a locally composed wax-stamp/seal asset.
- The new `public/stamps/quest-complete-seal.png` uses:
  - red wax/scalloped seal shape
  - gold circular trim
  - distressed stamp texture
  - readable `QUEST COMPLETE` / `SIDE QUEST CHESS` text bands
  - the actual Proof Loop Test / SQC coat-of-arms image centered inside the seal
- Removed the extra overlaid `Quest completed` text from the page markup so the stamp itself carries the completed-state identity.
- Kept the completion date pill below the seal.

## Verification

- Visual preview checked on dark background.
- `pnpm lint` passed with only existing accepted warnings.
- `pnpm build` passed.
