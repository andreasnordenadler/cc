# SQC Reddit paid ad concepts + organic guidelines — 2026-05-15

Purpose: plan Reddit acquisition/testing for Side Quest Chess without spam and without unapproved spend.

Hard rule: **do not post externally and do not spend money unless Andreas explicitly approves the account identity, campaign, budget, and first-message tone.**

## Audience thesis

Side Quest Chess is easiest to explain as:

> Chess with weird optional side quests and ridiculous coats of arms.

Best first ask:

> Try one low-friction quest, then one funny harder quest.

Primary downstream metrics:

1. Signup
2. Quest start
3. Quest completion
4. Multiplayer Side Quest join/create
5. Share/proof click

Vanity metrics like impressions and upvotes are useful only if they correlate with actual SQC usage.

## Paid Reddit targeting hypotheses

| Hypothesis | Targeting direction | Why it might work | Risk | Measurement |
|---|---|---|---|---|
| H1: Casual chess players want funny challenges | Chess interest + chess subreddits where ads are allowed | Core user fit; easiest “what is this?” path | Chess audiences may reject gimmicks if too salesy | CTR, signup rate, quest-start rate |
| H2: Chess meme consumers like absurd quest hooks | Chess memes / gaming humor interests | SQC is inherently meme-friendly | Clicks may be low-intent | Quest-start per click; comments sentiment |
| H3: Lichess/Chess.com players care about public proof | Chess platform interest keywords | SQC checks real public games; proof angle is concrete | Platform-specific ad copy may feel too narrow | Profile username save, verifier check event |
| H4: Friend challenge angle drives multiplayer | Gaming/social challenge communities | “Make friends suffer too” is shareable | Multiplayer flow has more friction than solo | Multiplayer create/join CPA |
| H5: Indie/web toy people try weird browser experiments | SideProject/indie/webgame interests | SQC is a playful web toy/product | Less chess intent | Signup to quest-start conversion |

## 8 paid ad variants

### Variant 1 — Core explainer

**Headline:** Chess, but with stupidly hard side quests

**Body:** Pick a weird chess challenge, play real games on Lichess or Chess.com, and Side Quest Chess checks whether you pulled it off. Win without castling. Survive after losing your queen. Earn proof when the bad idea works.

**CTA:** Start a quest

**Creative:** Quest Hub screenshot with 3 cards: No Castle Club, Queen? Never Heard of Her, Pawn Storm Maniac.

**Targeting hypothesis:** H1 casual chess players.

**Metrics:** CTR > 0.6%; signup/click > 8%; quest-start/signup > 40%.

### Variant 2 — Queenless hook

**Headline:** Can you win after throwing away your queen?

**Body:** Queen? Never Heard of Her is a Side Quest Chess challenge: lose your queen before move 15, then still win. SQC checks your public Lichess/Chess.com game and gives you proof if you somehow survive.

**CTA:** Try the queenless quest

**Creative:** Queen capture board moment + SQC proof/badge card.

**Targeting hypothesis:** H2 chess meme/challenge audience.

**Metrics:** Comments mentioning “impossible/try”; quest-start rate for `queen-never-heard-of-her`; completion attempts.

### Variant 3 — Beginner-safe challenge

**Headline:** Win a chess game without castling

**Body:** Start with No Castle Club: one simple side quest, one real chess game, one tiny badge if you pull it off. Side Quest Chess is a free challenge layer for Lichess/Chess.com players.

**CTA:** Try No Castle Club

**Creative:** King/rook with “No royal shortcuts” text.

**Targeting hypothesis:** H1, with lower-friction quest.

**Metrics:** Highest quest-start/signup rate; first completion rate; bounce rate vs queenless ad.

### Variant 4 — Proof/receipt angle

**Headline:** Brag about cursed chess wins with receipts

**Body:** SQC verifies public games and creates shareable proof for ridiculous chess challenges. If you win after a bad idea, you get points, badges, and documentation.

**CTA:** Get a proof scroll

**Creative:** Proof scroll / coat-of-arms / badge vault screenshot.

**Targeting hypothesis:** H3 proof matters to competitive/social players.

**Metrics:** Profile save rate; verifier check events; share/proof clicks.

### Variant 5 — Friend dare

**Headline:** Send your chess friend a terrible idea

**Body:** Side Quest Chess lets you pick a ridiculous quest and dare a friend to complete it in a real Lichess or Chess.com game. No Castle Club is friendly. Rookless Rampage is a cry for help.

**CTA:** Dare a friend

**Creative:** Invite/share card with “No Castle Club” and “Rookless Rampage” contrast.

**Targeting hypothesis:** H4 social/friend challenge.

**Metrics:** Dare/share link clicks; Multiplayer create/join; returning sessions.

### Variant 6 — Multiplayer chaos

**Headline:** Make your chess group suffer together

**Body:** Create a Multiplayer Side Quest, invite friends, and see who can complete the same cursed chess objective first. Real games elsewhere. SQC checks the proof.

**CTA:** Create a Multiplayer Side Quest

**Creative:** Multiplayer dashboard/invite page with 2-3 participant names mocked/safe.

**Targeting hypothesis:** H4 multiplayer/chess club fit.

**Metrics:** Multiplayer create rate; join rate per created quest; cost per join.

### Variant 7 — Anti-training positioning

**Headline:** Not chess training. Chess side quests.

**Body:** No engine dashboard. No opening course. Just dumb, hard optional objectives for your normal online chess games — and proof when the nonsense works.

**CTA:** Pick a bad idea

**Creative:** Simple text-led ad with crossed-out “engine dashboard” and highlighted “side quests.”

**Targeting hypothesis:** H2/H5 users tired of serious chess improvement content.

**Metrics:** CTR; positive comment sentiment; quest starts from non-chess-targeted interests.

### Variant 8 — Absurd tier

**Headline:** Rookless Rampage is rated-only for a reason

**Body:** Some Side Quest Chess quests are merely weird. This one is absurd: lose both rooks and still win a rated game. If that sounds awful, perfect.

**CTA:** See the absurd quests

**Creative:** Two fallen rooks + `Absurd` difficulty badge.

**Targeting hypothesis:** H2 hardcore/meme chess players click impossible challenges.

**Metrics:** High engagement/comment rate; lower conversion expected; track hard-quest starts and later completions.

## Paid test structure

Minimum viable first test after approval:

- 2 audiences: chess interest + chess meme/gaming humor interest.
- 3 creatives: Variant 1 core, Variant 2 queenless, Variant 3 No Castle Club.
- 3-5 day test window.
- Small budget only; stop early if comments are hostile or quest-start CPA is clearly bad.
- Use distinct UTMs per variant.

Suggested UTM pattern:

`?utm_source=reddit&utm_medium=paid&utm_campaign=sqc_launch_test&utm_content=queenless_v2`

Decision rules:

- Kill: clicks but no signups/quest starts after meaningful traffic.
- Iterate: good comments/CTR but low quest starts; landing/onboarding mismatch likely.
- Scale cautiously: quest starts and completions appear, not just clicks.

## Organic Reddit guidelines

### Current known constraints from target research

- `r/chess`: do not self-promote from a fresh/no-history account. Build genuine participation first or ask modmail for approval.
- `r/lichess`: good fit, but prior submit hit Reddit friction. Do not brute-force.
- `r/chessbeginners`: skip unless mods explicitly approve; rules prohibit self-promo/adverts.
- `r/WebGames`: poor fit while meaningful SQC flows use sign-in.
- `r/alphaandbetausers`: standalone post was filtered; only use natural comments in threads that invite projects.
- Owned subreddit `r/SideQuestChess` is safe for official updates, welcome posts, quest-of-week threads, and proof threads.

### Organic posture

Default to **comment-first, helpful, disclosed, low-link**.

Good organic actions:

- Answer chess challenge / web toy / feedback threads without linking unless directly relevant.
- Share lessons learned from building SQC when communities ask about side projects or agent-built apps.
- Ask for feedback in communities that explicitly allow project feedback.
- Use `r/SideQuestChess` as the hub for official posts and proof prompts.
- If linking SQC, disclose relationship clearly: “I’m building this.”

Bad organic actions:

- Mass-posting identical launch copy.
- Dropping links into unrelated chess threads.
- Posting in r/chess before account participation/mod approval.
- Reposting immediately when Reddit filters remove something.
- Pretending to be a normal user who “found” SQC.

### Comment templates

Use only when context genuinely fits.

**When someone asks for chess challenge ideas:**

> One fun format is to add a side objective on top of normal games: win without castling, win after an early queen loss, mate with a knight, etc. I’m building a small site around exactly that idea called Side Quest Chess, but you can also run the format manually with friends. The key is making the objective clear and requiring a win so it does not become pure throwing.

**When someone asks for side-project feedback sources:**

> For game-ish side projects, I’d start with comment participation and small feedback threads before posting a launch link. Chess communities in particular are pretty sensitive to self-promo, so I’d ask for critique on one concrete loop rather than “please try my app.”

**When posting in owned r/SideQuestChess:**

> Quest of the week: Queen? Never Heard of Her. Lose your queen before move 15, then still win. If you pull it off, post the proof scroll here so the rest of us can judge your life choices respectfully.

### First organic post angle outside owned subreddit

Only after account trust/mod approval:

**Title:** I built a free chess side-quest layer for Lichess/Chess.com games — looking for feedback on whether the first quest loop is understandable

**Body outline:**

- Disclose: “I’m building this.”
- One-sentence concept: chess with optional side quests.
- Ask for specific feedback: Does the quest loop make sense? Is username/public-game checking clear? Which quest sounds fun vs annoying?
- Link once, near bottom.
- No hype, no “revolutionary,” no pressure to sign up.

## Reporting template

For any Reddit test, report:

- Date / subreddit or ad audience
- Post/ad variant
- Spend (if paid)
- Impressions
- CTR
- Comments/sentiment
- Signups
- Quest starts
- Quest completions
- Multiplayer creates/joins
- Decision: stop / revise / continue
