# SQC heraldic badge direction

Date: 2026-04-26 16:56 Europe/Stockholm  
Source: Andreas asked that Side Quest Chess badges use **SQC** short-form and become meaningful coat-of-arms badges inspired by the Nordenadler coat of arms.

## Direction

Every challenge badge should behave like a small coat of arms:

- a shield, not a generic achievement blob
- a central charge/symbol that represents the challenge
- a crest or achievement marker above the shield
- a motto/ribbon that captures the dare
- a clear meaning so the badge feels earned, not decorative

## Inspiration read

I reviewed `https://nordenadler.com/` and the visible Nordenadler crest as visual inspiration only. Reusable principles:

- central heraldic shield
- strong vertical symmetry
- deep blue / gold / silver / red / black palette
- formal shield + crest hierarchy
- symbolic animals/objects/stars/florals/ornaments
- premium, ceremonial, earned-status feeling

Important boundary: do **not** copy the Nordenadler family arms. Use heraldic structure and meaning discipline, not the specific personal/family symbols.

## First generated concept artifact

Generated first SQC queenless badge concept:

`/Users/sam/.openclaw/media/tool-image-generation/sqc-queenless-heraldic-badge---54d63fe5-fd83-4420-ba7d-5e3d56f1825a.png`

Two broader concept-sheet attempts were aborted by the image-generation tool, so the implementation proceeded with one generated badge plus code-level heraldic system work.

## Implemented data model direction

Each starter challenge now has heraldic meaning fields:

- `shield` — field/partition design concept
- `charge` — central symbol
- `crest` — top symbolic marker
- `motto` — short heraldic phrase
- `meaning` — why the symbols represent the challenge

## Starter heraldic meanings

- **Queen? Never Heard of Her** — broken queen crown + resilient wing: queen sacrificed, player still rises and wins.
- **No Castle Club** — walking king + crossed rook towers: no shelter, still standing.
- **The Blunder Gambit** — broken piece + phoenix spark: early mistake converted into victory.
- **Pawn Storm Maniac** — six-pawn storm + lightning: reckless pawn weather becomes attack.
- **Knightmare Mode** — knight head + checkmate star: the horse owns the final blow.
- **Rookless Rampage** — fallen twin rooks + laurel: both towers gone, victory remains.
- **One Bishop to Rule Them All** — solitary bishop + candle: one diagonal piece carries the endgame.

## Verification

Implemented and verified on 2026-04-26:

- `pnpm lint` passed.
- `pnpm build` passed.
- Local route smoke passed for `/`, `/challenges`, `/challenges/queen-never-heard-of-her`, `/result`, and `/account` with heraldic markers including `Glory Without Her`, `Broken queen crown`, and `No Walls, Still Standing`.
- Commit: `e0c64be` (`Make SQC badges heraldic challenge arms`).
- Vercel production deploy: `https://cc-pb2jdvt2g-andreas-nordenadlers-projects.vercel.app`, aliased to `https://cc-taupe-kappa.vercel.app`.
- Production route smoke passed for `/`, `/challenges`, `/challenges/queen-never-heard-of-her`, `/result`, and `/account` with the same markers.
- Recent Vercel 500 scan found no logs.
