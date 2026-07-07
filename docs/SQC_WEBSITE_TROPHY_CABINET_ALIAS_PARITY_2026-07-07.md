# SQC website Trophy Cabinet alias parity - 2026-07-07

Source of truth: `apps/mobile/App.tsx`.

## Mobile source

- `TABS` labels the coat screen as `Trophy Cabinet`.
- `GlobalHamburgerMenu` opens the same screen with the `Trophy Cabinet` label.
- `CoatOfArmsScreen` renders the signed-in Coat of Arms shelf, the live coat roster, and the coat meaning list.

## Web slice

- `/badges` now owns the canonical `Trophy Cabinet · Side Quest Chess` route metadata.
- `/trophy-cabinet` and `/coat-of-arms` export the same metadata and page, keeping all three historic web routes on one mobile-style app screen.
- The Trophy Cabinet page now includes a parity note that maps the route aliases back to `CoatOfArmsScreen` while preserving existing web proof/account rows.

## Verification

- `pnpm build` passed.
- Local screenshot was blocked by Clerk middleware in dev: `curl http://127.0.0.1:3027/trophy-cabinet` returned `HTTP/1.1 500 Internal Server Error` after 30 seconds with `x-clerk-auth-reason: dev-browser-missing`; the dev server logged `Failed to proxy http://localhost:3027/trophy-cabinet Error: socket hang up`.
