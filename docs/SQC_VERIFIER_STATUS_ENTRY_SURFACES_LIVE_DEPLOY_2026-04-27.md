# SQC verifier status entry surfaces live deploy — 2026-04-27

## What shipped

Extended the verifier-status trust layer beyond the challenge hub/detail pages so high-traffic entry/share surfaces now stay honest about what is actually automated:

- `/today` shows the current daily dare's verifier state and evidence promise.
- `/random` shows verifier state for the selected roulette challenge and updates it as the spin changes.
- `/share-kit` shows live-backed / next-adapter / specified badges on every starter-deck invite card.

This keeps the viral/dare surfaces playful while avoiding fake-success or implied automation for challenges that are still rule-spec only.

## Files changed

- `src/app/today/page.tsx`
- `src/app/share-kit/page.tsx`
- `src/components/challenge-roulette.tsx`
- `.learnings/ERRORS.md` (tooling/deploy gotchas encountered during verification)

## Verification

- `pnpm lint` ✅
- `pnpm build` ✅
- Local route smoke via Python urllib against existing dev server on `127.0.0.1:3011` ✅
  - `/today` contained verifier status copy
  - `/random` contained verifier status copy
  - `/share-kit` contained verifier status copy
- Production deploy ✅
  - Deployment: `https://cc-j5ij7v9lr-andreas-nordenadlers-projects.vercel.app`
  - Aliased to: `https://sidequestchess.com`
- Production smoke via Python urllib ✅
  - `https://sidequestchess.com/today` contained specified verifier-state copy
  - `https://sidequestchess.com/random` contained specified verifier-state copy
  - `https://sidequestchess.com/share-kit` contained Live-backed, Next adapter, and Specified labels
  - `https://sidequestchess.com/challenges/queen-never-heard-of-her` still contained Live-backed copy
- Bounded Vercel log scan ✅
  - No `ERROR`/`500`/`501`/`502`/`503`/`504` lines returned during the short post-deploy scan.

## Notes

`vercel --prod --yes` printed a transient `Deployment not found` after emitting the production URL, but `vercel inspect` showed the deployment continued and became `Ready` with the expected aliases. Logged as a tooling gotcha in `.learnings/ERRORS.md`.
