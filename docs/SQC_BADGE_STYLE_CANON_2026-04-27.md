# SQC Badge Style Canon — 2026-04-27

Source: Andreas supplied the new badge for **Queen? Never Heard of Her** and said: “This is the style I want for all badges.”

## Canon reference asset

- Saved in app assets as: `public/badges/queen-never-heard-of-her-style-reference.jpg`
- Wired into the canonical challenge metadata as `badgeIdentity.image` for `queen-never-heard-of-her`.

## Style rules for all future/generated badges

Every Side Quest Chess badge should feel like a strange, collectible fantasy coat of arms — not a flat achievement icon.

Key visual traits:

- ornate heraldic shield composition
- symmetrical crest/mantling/supporters where useful
- rich black + antique gold linework
- saturated accent color per challenge, with hot pink allowed as SQC house energy
- chess-piece symbolism embedded into the shield/crest/supporters
- humorous/weird mythology, not serious medieval purity
- readable motto ribbon at the bottom
- high-detail illustrated look that still works as a collectible badge image

Queenless-specific notes:

- broken black queen on shield = queen sacrificed/lost
- crowned goblin supporters = gleeful bad-idea energy
- knight crest = chess identity and absurd nobility
- motto: `Glory Without Her`

## Product implementation note

The supplied queenless image is now used directly as the first real badge art. The existing CSS coat-of-arms tokens remain as fallback placeholders for badges that do not yet have final illustrated assets.
