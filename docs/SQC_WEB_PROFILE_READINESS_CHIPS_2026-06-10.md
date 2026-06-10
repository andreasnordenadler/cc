# SQC Web Profile Readiness Chips — 2026-06-10

Sprint: SQC website parity sprint 2026-06-09 → 2026-06-10.

## Shipped

- Added a mobile-aligned profile readiness summary to website `/profile` for signed-in runners.
- Shows Display name, Brag line, Lichess, and Chess.com readiness using the existing account readiness chip styling.
- Keeps profile editing in the current website form and preserves the site's look/feel.
- Does not expose private emails, raw custom configs, invite codes, or destructive account actions.

## Verification

- `pnpm lint -- src/app/profile/page.tsx`
- `pnpm build`
- Commit: `566e468`
- Production deploy: `https://cc-6r07401xq-andreas-nordenadlers-projects.vercel.app` → `https://sidequestchess.com`
- Live smoke: 200 for production/deploy `/profile?profileReadinessSmoke=20260610` with signed-out profile/sign-in content; 200 for production `/challenges?profileReadinessSmoke=20260610`.
