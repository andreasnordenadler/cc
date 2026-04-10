# Chess.com validation audit — 2026-04-11

## Question

Can CC add Chess.com username capture and automated public-game validation in roughly the same narrow way it currently supports Lichess?

## Verdict

**Yes, probably.**

A narrow Chess.com integration looks viable for the same core loop shape:
- store a public Chess.com username
- accept a pasted Chess.com game URL or game identifier
- fetch public game data from Chess.com's published-data API
- verify username presence, side played, and result outcome
- persist `passed`, `failed`, or `pending` verdicts the same way CC already does for Lichess

## Why this looks viable

### 1. Chess.com exposes public player game archives
Chess.com's published-data API documents public game archive endpoints for players, including archive discovery and monthly game lists.

Documented/public path shape observed:
- `https://api.chess.com/pub/player/{username}/games/archives`
- `https://api.chess.com/pub/player/{username}/games/{YYYY}/{MM}`

### 2. Public monthly game responses include the minimum fields CC needs
A live sample from:
- `https://api.chess.com/pub/player/hikaru/games/2024/12`

returned per-game data including:
- `url`
- `white.username`
- `black.username`
- `white.result`
- `black.result`
- `end_time`
- `time_class`
- `uuid`

That is enough for the minimum current CC verifier model:
- identify whether the saved username appears in the game
- determine whether the user played White or Black
- determine whether the game ended in a win, draw, or loss
- confirm the game is finished

### 3. Result codes appear sufficient for win/draw/loss checks
Observed result pairs included examples such as:
- `('checkmated', 'win')`
- `('resigned', 'win')`
- `('timeout', 'win')`
- `('insufficient', 'insufficient')`
- `('repetition', 'repetition')`

This suggests CC can likely map Chess.com public result codes into the same narrow challenge outcomes it already supports for Lichess:
- finish-any-game
- finish-as-white / black
- win-as-white / black
- draw-any-game / draw-as-white / draw-as-black
- lose-any-game / lose-as-white / lose-as-black

## Important difference vs. Lichess

This is **not as clean as Lichess**.

Lichess gives CC a direct single-game export path from a pasted game ID.
Chess.com appears more likely to require one of these narrower patterns:

1. **Pasted game URL path**
   - parse the Chess.com game URL
   - derive enough information to locate the game inside the player's public archive data
   - match by `url` (best case)

2. **Username + latest/public archive path**
   - query the player's public archive month
   - search recent games for the submitted URL or matching game record

The archive-based lookup is still workable, but it is a bit more indirect than Lichess.

## Risks / caveats

### Cache freshness
Chess.com's published-data API docs note cache behavior and warn that data may refresh only periodically rather than instantly. That means:
- very recent games may not appear immediately
- CC should be ready to return `pending` when a submitted Chess.com game has not surfaced yet

### Rate limiting
Chess.com documents that serial access is generally fine, but parallel requests may hit `429` limits. CC should keep this path narrow and serial.

### URL/ID normalization still needs a small implementation pass
Before shipping, CC still needs a real parser for:
- Chess.com live game URLs
- Chess.com daily game URLs if we want them in-scope
- exact matching rules against `url` or another stable game identifier

## Smallest recommended next slice

The safest first implementation is:

### Phase 1
- add an optional Chess.com username field next to the existing Lichess identity
- support **pasted Chess.com game URL verification only**
- implement exactly one narrow challenge verifier first, preferably:
  - `finish-any-game`

### Why this is the right first slice
It proves the whole Chess.com path without widening scope into:
- latest-game discovery heuristics
- multi-provider fallback logic
- challenge-catalog-wide outcome mapping all at once
- broader UX redesign

## Recommended follow-up order

1. Chess.com username capture in account metadata
2. Chess.com pasted-game URL parser + public archive lookup
3. `finish-any-game` only on Chess.com
4. side-aware finish checks
5. win/draw/loss outcome checks after the basic path is stable

## Recommendation

**Proceed, but do not promise “same as Lichess” internally.**

The right product framing is:
- Lichess remains the clean reference integration
- Chess.com looks viable as a second public-game verifier path
- the first shipped Chess.com slice should be pasted-game based and challenge-narrow

## Source-backed evidence used in this audit

### Chess.com docs
- Chess.com published-data API docs describe public player game archive endpoints and note read-only/public access, caching caveats, and rate limiting.

### Live API checks run during this audit
- `https://api.chess.com/pub/player/hikaru/games/archives`
- `https://api.chess.com/pub/player/hikaru/games/2024/12`

Observed fields in live monthly game data:
- `url`
- `white.username`
- `black.username`
- `white.result`
- `black.result`
- `end_time`
- `time_class`
- `uuid`
