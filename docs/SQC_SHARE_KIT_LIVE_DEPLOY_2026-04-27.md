# SQC Share Kit Live Deploy — 2026-04-27

## Result

Added a public Side Quest Chess share kit at `/share-kit` so the starter deck has one browseable viral-loop surface for exact friend-dare links, daily/random rituals, proof-loop links, and challenge-specific OG preview targets.

## User-visible changes

- New route: `https://sidequestchess.com/share-kit`
- Homepage hero includes an `Open share kit` CTA.
- Homepage product grid includes a Share Kit card.
- Primary nav includes `Share kit`.
- Every starter challenge gets a share card with:
  - coat-of-arms badge
  - objective and reward
  - direct `/dare/[id]` link
  - `/api/og/dare/[id]` preview-card link
  - copy/native-share actions using challenge-specific dare text

## Verification

- `pnpm lint` ✅
- `pnpm build` ✅
- Local smoke via Python urllib on dev server ✅
  - `http://localhost:3011/share-kit` → 200 and expected share-kit hero copy
  - `http://localhost:3011/` → 200 and `Open share kit`
  - `http://localhost:3011/dare/queen-never-heard-of-her` → 200
  - `http://localhost:3011/api/og/dare/queen-never-heard-of-her` → 200 image/png
- Production deploy ✅
  - Deployment: `https://cc-j5pt254ri-andreas-nordenadlers-projects.vercel.app`
  - Aliased: `https://sidequestchess.com`
- Production smoke via Python urllib ✅
  - `https://sidequestchess.com/share-kit` → 200 and expected share-kit hero copy
  - `https://sidequestchess.com/` → 200 and `Open share kit`
  - `https://sidequestchess.com/dare/queen-never-heard-of-her` → 200
  - `https://sidequestchess.com/api/og/dare/queen-never-heard-of-her` → 200 image/png
- Vercel production error scan ✅
  - `vercel logs --environment production --status-code 500 --since 30m --limit 20 --no-branch` → no logs found
  - same for 501, 502, 503, and 504 → no logs found

## Notes

The route intentionally stays away from PGN upload, engine-dashboard, and serious training framing. It centers challenge-specific dare links rather than generic homepage sharing.
