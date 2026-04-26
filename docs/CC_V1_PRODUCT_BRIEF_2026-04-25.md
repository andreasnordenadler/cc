# CC / Side Quest Chess v1 Product Brief

Created: 2026-04-25 23:00 Europe/Stockholm  
Owner: Sam  
Source: Andreas Telegram brief `blundercheck_mockup_brief_for_sam---5de88065-130d-4d1d-8d25-08c44db53dcf.md`
Production naming update: Andreas chose **Side Quest Chess** on 2026-04-26; primary domain **sidequestchess.com**, backup **sqchess.com**. Former working/mockup name: **BlunderCheck**.

## 1. Product truth

Side Quest Chess / CC is not a chess training dashboard.

It is:

> **Chess, but with stupidly hard side quests.**

The product should feel like a smart chess friend daring you to do something dumb, then giving you proof when the dumb thing somehow works.

## 2. Core promise

> Pick a ridiculous chess challenge, play real games on Lichess or Chess.com, and let Side Quest Chess verify whether you pulled it off.

Shorter product promise:

> **Play normal chess. Complete ridiculous challenges. Brag when it works.**

## 3. Emotional target

The user should think:

> “This is a terrible idea. I want to try it.”

Tone:
- playful
- smart
- mischievous
- chess-aware
- meme-friendly
- slightly chaotic
- not childish
- not corporate
- not serious-training coded

## 4. What v1 must prove

V1 is successful if a new visitor understands within 10 seconds:

1. **What is this?** A chess side-quest/challenge layer.
2. **How does it work?** Pick challenge → play on Lichess/Chess.com → Side Quest Chess checks games.
3. **Why is it fun?** The challenges are weird, hard, funny, and shareable.

V1 does not need to be the full community platform. It must prove the loop is desirable.

## 5. Core user loop

1. Discover a weird challenge.
2. Think “that sounds stupid but fun.”
3. Start the challenge.
4. Connect or identify a Lichess / Chess.com account.
5. Play normal games on the external chess platform.
6. Side Quest Chess checks recent games automatically.
7. Get a satisfying success or failure result.
8. Earn points / badge / streak progress.
9. Share the result or challenge a friend.
10. Try another bad idea.

## 6. V1 product surfaces

Priority order:

1. **Challenge Hub** — the product center. “Pick your next bad idea.”
2. **Completion / Share Result** — the viral proof moment. “You did it. Somehow.”
3. **Challenge Detail** — funny concept plus exact rules.
4. **Landing Page** — instant explanation and invitation.
5. **Connect Account / Onboarding** — friendly and non-technical.
6. **Active Challenge / Game Check** — bridge between Side Quest Chess and real chess games.
7. **Profile / Achievements / Leaderboard** — identity and progression.

## 7. Canonical first challenge

Use this as the primary v1 flow:

**Queen? Never Heard of Her**  
Win a rated or casual game after losing your queen before move 15.

- Category: Blunder Challenge
- Difficulty: Brutal
- Reward: 500 points
- Badge: Certified Queenless Maniac
- Flavor: “The queen is overrated. Probably.”

Clear rules:
- You must lose your queen before move 15.
- Your opponent must still have their queen after that moment.
- You must win the game.
- Game must be at least 10 moves.
- Rapid, blitz, or bullet allowed.
- Rated or casual allowed.
- Variants not allowed.

## 8. Starter challenge library

- **Queen? Never Heard of Her** — Win after losing your queen before move 15. Brutal, +500.
- **No Castle Club** — Win without castling. Medium, +150.
- **The Blunder Gambit** — Hang a piece in the first 10 moves and still win. Hard, +300.
- **Pawn Storm Maniac** — Move at least six pawns before move 15 and win. Hard, +350.
- **Knightmare Mode** — Deliver checkmate with a knight. Brutal, +600.
- **Rookless Rampage** — Win after losing both rooks. Absurd, +900.
- **One Bishop to Rule Them All** — Win with only one bishop remaining as your minor piece. Hard, +400.
- **The “I Meant That” Challenge** — Make a move classified as a blunder, then win. Hard, +450.

## 9. Anti-goals

Do not build or imply:
- chess engine analysis
- opening theory dashboard
- PGN upload
- pasted game import
- formal lessons
- full chess-playing app
- serious improvement dashboard
- payment/admin tooling in v1
- dense chart/table analytics

If a design starts looking like ChessBase, a SaaS dashboard, or a training academy, it is wrong.

## 10. V1 implementation plan

### Phase 1 — Product/design lock

Goal: make the concept visually and emotionally clear.

Deliverables:
- updated `ccdesign` prototype centered on Challenge Hub and Share Result
- explicit 10-second comprehension checklist
- visual direction notes: badge/card/share-poster style, playful but sharp

Proof:
- `pnpm build` in `ccdesign`
- local route verified
- brief review note says whether it answers: what / how / why fun

### Phase 2 — Static MVP in `cc`

Goal: replace starter scaffold with a real Side Quest Chess web MVP shell.

Deliverables:
- landing page
- challenge hub
- challenge detail page for Queen? Never Heard of Her
- static result/share page
- challenge data model in code
- product copy and visual system aligned to this brief

Proof:
- `pnpm lint` / `pnpm build` in `cc`
- local route checks
- commit with clear message

### Phase 3 — Lightweight account/platform flow

Goal: make the user understand Lichess/Chess.com connection without overbuilding integration.

Deliverables:
- connect-account/onboarding route
- username/platform capture placeholder
- active challenge state mock backed by local/static data
- no PGN/manual upload path

Proof:
- build checks
- manual route checks

### Phase 4 — Real verification spike

Goal: determine the smallest reliable way to verify challenge completion from Chess.com/Lichess public or authenticated game data.

Deliverables:
- API feasibility note
- one parser/checker for `Queen? Never Heard of Her`
- documented limitations

Proof:
- repeatable local test fixture
- no external destructive actions

### Phase 5 — Public v0 deploy

Goal: make the product reviewable and shareable.

Deliverables:
- deploy route/site
- smoke checks
- clear open loops for auth, verification, and sharing

Proof:
- live URL
- smoke verification

## 11. Current next build step

Start with **Phase 1** in `ccdesign`:

> Refine the mobile-first prototype so the Challenge Hub and Completion/Share screen are unmistakably the product core.

Acceptance:
- Challenge Hub immediately communicates “pick your next bad idea.”
- Share Result feels like a collectible/viral proof card.
- Challenge Detail balances absurdity with trustworthy rules.
- Landing explains the product in one glance.
- No serious dashboard or training language remains.

