# SQC Web Home Active Custom Solo Control — 2026-06-10

## Slice

Closed a small website home parity gap versus mobile-v251: the signed-in website home Active Solo Side Quest card now recognizes active Custom Solo Side Quests, not only official Solo quests.

## What changed

- Resolves the active Solo quest against the signed-in user's Custom Solo library when the active ID is custom.
- Shows the custom title and coat in the existing home active-card treatment.
- Lets website-first runners use the same `Check latest game` home control for active Custom Solo runs via the shared quest action path.
- Keeps the secondary action pointed at `/account/custom-side-quests` for custom exact-game proof, lifecycle controls, rule summaries, and receipts.
- Preserves existing official Solo home behavior and current website look/feel.

## Privacy / safety

- No raw custom rule config is rendered on the home page.
- Private Custom Solo data stays scoped to the signed-in account.
- No production data was changed destructively.

## Verification

- `pnpm lint -- src/app/page.tsx`
- `pnpm build`
- `pnpm deploy:prod` → `https://cc-qtwbsmgaz-andreas-nordenadlers-projects.vercel.app` aliased to `https://sidequestchess.com`
- Live smoke: production and deploy `/ ?homeCustomActiveSmoke=20260610` returned 200; signed-out `/account/custom-side-quests?homeCustomActiveSmoke=20260610` resolved to sign-in.
