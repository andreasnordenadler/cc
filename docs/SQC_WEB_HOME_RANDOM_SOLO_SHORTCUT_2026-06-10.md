# SQC Web Home Random Solo Shortcut — 2026-06-10

Closed a small website home discovery parity gap versus mobile-v251: the mobile home screen has a direct `Surprise me with a random Solo Side Quest` action, while the website home only offered fixed heroism choices and a link to the Solo deck.

## Shipped

- Added the existing random Solo quest control to the website home heroism panel.
- Reused the same random pool behavior as `/challenges`: skip coming-soon IDs and prefer quests that are not currently active or already completed when signed in.
- Preserved the current home look and feel by placing the action inside the existing `Where to begin` card, with only small spacing CSS.

## Verification

- `pnpm lint -- src/app/page.tsx src/components/random-solo-quest-link.tsx`
- `pnpm build`
- Commit: `40a2609`
- Production deploy: `https://cc-8qhkyt5bl-andreas-nordenadlers-projects.vercel.app` aliased to `https://sidequestchess.com`
- Live smoke: production and deploy `/` returned 200 with `Surprise me with a random Solo Side Quest` and `How heroic are you feeling today?`; production `/challenges?homeRandomSmoke=20260610` still returned 200 with the random Solo action.
