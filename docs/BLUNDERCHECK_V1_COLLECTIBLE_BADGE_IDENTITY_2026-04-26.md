# BlunderCheck v1 collectible badge identity

Date: 2026-04-26 16:58 Europe/Stockholm  
Scope: CC / BlunderCheck Phase 8

## Shipped

- Added stable `badgeIdentity` metadata to every starter challenge: display name, motif, rarity, unlock copy, and colorway.
- Added reusable `ChallengeBadge` tokens that support compact hub cards and large proof-card/detail presentation.
- Updated the challenge hub, challenge detail, homepage canonical quest teaser, and dynamic `/result` proof card to show challenge-specific collectible badges instead of generic reward text only.
- Kept the implementation asset-light and iteration-friendly: the badge system can use generated image assets later, but the product no longer blocks on final art.

## Starter badge set

- Queen? Never Heard of Her → Queenless Gremlin
- No Castle Club → King Walk Club
- The Blunder Gambit → Theory Accident
- Pawn Storm Maniac → Pawn Monsoon
- Knightmare Mode → Horse Felony
- Rookless Rampage → Demolition Permit
- One Bishop to Rule Them All → Bishop HR

## Verification

- `pnpm lint` — passed.
- `pnpm build` — passed.
- Local route smoke against `pnpm start` — passed:
  - `/challenges` returned 200 and rendered unique badge names including `Queenless Gremlin`, `King Walk Club`, `Pawn Monsoon`, and `Horse Felony`.
  - `/challenges/queen-never-heard-of-her` returned 200.
  - `/result` returned 200 and rendered `Badge target` + `Queenless Gremlin`.
  - `/account` returned 200.

## Notes

The visual language follows Andreas's unique-badges direction while preserving the side-quest tone: collectible, mischievous, chess-aware, and not a corporate achievement system.
