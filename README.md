# CC / BlunderCheck

CC is the internal project lane for **BlunderCheck**.

BlunderCheck is:

> **Chess, but with stupidly hard side quests.**

Users pick weird chess challenges, play real games on Lichess or Chess.com, and BlunderCheck verifies whether they completed the challenge. Successful attempts earn points, badges, streaks, and shareable proof.

## Current product canon

- Product feel: playful, smart, mischievous, chess-aware, meme-friendly.
- Core loop: pick challenge → play real chess elsewhere → automatic verification → result → points/badge/share/friend challenge.
- Primary challenge flow: **Queen? Never Heard of Her** — win after losing your queen before move 15.
- Anti-goals: no engine dashboard, no PGN upload, no formal training product, no corporate SaaS framing.

## Key docs

- V1 product brief: `docs/CC_V1_PRODUCT_BRIEF_2026-04-25.md`
- Roadmap: `ROADMAP.md`
- Design sandbox: `/Users/sam/.openclaw/workspace/ccdesign`

## Development

This is a Next.js app.

```bash
pnpm install
pnpm dev
pnpm build
```

Do not claim live/public progress until the app has a deployed URL and smoke verification.
