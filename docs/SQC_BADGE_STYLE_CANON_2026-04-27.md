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

The supplied queenless image is used directly as the first real badge art. On 2026-04-27, the remaining six starter challenges received matching generated illustrated PNG assets and are now wired through `badgeIdentity.image`:

- `no-castle-club` → `public/badges/no-castle-club-badge.png`
- `the-blunder-gambit` → `public/badges/the-blunder-gambit-badge.png`
- `pawn-storm-maniac` → `public/badges/pawn-storm-maniac-badge.png`
- `knightmare-mode` → `public/badges/knightmare-mode-badge.png`
- `rookless-rampage` → `public/badges/rookless-rampage-badge.png`
- `one-bishop-to-rule-them-all` → `public/badges/one-bishop-to-rule-them-all-badge.png`

The CSS coat-of-arms token renderer remains as an accessible/fallback path for future challenges that do not yet have final illustrated assets.

## Reusable generation prompt shape

Use the supplied queenless badge as a **style reference only**, then vary challenge symbolism:

> Create a matching Side Quest Chess collectible illustrated heraldic badge asset for the challenge `[challenge title]`. Use the provided queenless badge image only as a style reference, not as content to copy. Square badge artwork, ornate heraldic shield, black and gold linework, saturated `[challenge accent]` palette, fantasy collectible feel. Symbolism: `[specific chess symbols and joke mythology]`. Motto ribbon text `[short motto]`. Centered high-detail badge, crisp readable silhouette, no app UI, no people, no photorealism.
