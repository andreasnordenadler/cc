# SQC Web Public Proof Receipt Polish — 2026-06-11

## Sprint slice

Continued the 24h SQC website UX parity review with the public proof receipt page at `/proof/[token]`.

## User-facing changes

- Turned the public proof hero into a clearer receipt summary with runner, proof source, reward, and completed-time facts.
- Replaced the generic browse CTA with route-aware `Browse Official Solo` / `Browse Community Solo` language.
- Added player-facing proof-board context so the final-position board explains that SQC used the same verifier path as the original claim.
- Reworked the share area into an SQC-styled `Next step` panel with separate `Share receipt` and `Run another quest` cards.
- Added a Multiplayer browse path from public receipts so shared proof links can lead viewers into another SQC run without feeling like a dead end.
- Kept the existing proof token decoding, public proof image path, share controls, verifier data, and public receipt behavior unchanged.

## Checks

- `pnpm lint -- 'src/app/proof/[token]/page.tsx' src/app/globals.css`  
  - Passed with the existing CSS ignored-file warning.
- `pnpm build`  
  - First run caught a provider-label type mismatch (`chesscom` vs existing `chess.com` literal); fixed before shipping.
  - Second run passed.

## Deployment / smoke

Pending production deploy and live smoke for this slice.
