# SQC proof log live deploy — 2026-04-27

## Change

Added a new Side Quest Chess `/proof-log` surface for saved latest-game verifier receipts.

The page gives signed-in players a receipt history for passed, failed, or pending challenge checks without introducing PGN upload, engine-analysis, or training-dashboard framing. It also includes an empty state that sends new visitors toward Today, Random, Connect, and the account checker.

## Files changed

- `src/app/proof-log/page.tsx` — new proof log route backed by saved Clerk public metadata challenge attempts.
- `src/components/site-nav.tsx` — added Proof log navigation state/link.
- `src/app/page.tsx` — added homepage CTA/card for the proof log.

## Verification

- `pnpm lint` ✅
- `pnpm build` ✅
- Local route smoke on dev server `127.0.0.1:3011` ✅
  - `/`
  - `/proof-log`
  - `/result`
  - `/account`
  - `/challenges`
- Production deploy ✅
  - Vercel deployment: `https://cc-cy3dlov3o-andreas-nordenadlers-projects.vercel.app`
  - Aliased to: `https://sidequestchess.com`
- Production smoke ✅
  - `https://sidequestchess.com/`
  - `https://sidequestchess.com/proof-log`
  - `https://sidequestchess.com/result`
  - `https://sidequestchess.com/account`
  - `https://sidequestchess.com/challenges`
- Vercel production error-log scan ✅
  - 500: 0 in last 30m
  - 501: 0 in last 30m
  - 502: 0 in last 30m
  - 503: 0 in last 30m
  - 504: 0 in last 30m

## Notes

One smoke command initially used `curl` and failed in this shell with `command not found`; reran successfully with `/usr/bin/curl`.
