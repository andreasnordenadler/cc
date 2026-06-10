# SQC Web Custom Solo Trophy Cabinet — 2026-06-10

Closed a website Trophy Cabinet parity gap versus mobile-v251: the signed-in website `/account` trophy cabinet now includes completed Custom Solo Side Quests, not only official Solo coats and Multiplayer podium scrolls.

## Shipped

- Added completed Custom Solo cards to the existing account trophy cabinet lane.
- Preserved the current trophy-card styling, wax seal treatment, and account page layout.
- Shows safe custom quest title, custom coat image, completion/proof time, provider/game context, and a link back to `/account/custom-side-quests` for the full saved receipt/board controls.
- Keeps raw custom rule configs, private metadata, invite codes, and participant data hidden.
- Empty-state and trophy-cabinet headings now count official Solo, Custom Solo, and Multiplayer trophies together.

## Verification

- `pnpm lint -- src/app/account/page.tsx`
- `pnpm build`
- Production deploy: `https://cc-rm2zpho07-andreas-nordenadlers-projects.vercel.app` → `https://sidequestchess.com`
- Live smoke: signed-out production and deploy `/account?customTrophySmoke=20260610` resolved to sign-in content, production `/challenges?customTrophySmoke=20260610` returned 200 Side Quest content, and `/account/custom-side-quests?customTrophySmoke=20260610` resolved to sign-in content.
