# SQC private beta dual-host status copy live deploy — 2026-04-28

## Scope

Tightened private-beta and verifier-board copy so the live product no longer implies Chess.com support is only future-facing or that No Castle Club is the sole dual-host path.

Changed surfaces:
- `/verifiers`: derives live, dual-host, and Lichess-only counts from verifier status metadata.
- `/beta`: names the current private-beta verifier posture as four dual-host quests.
- `/connect`: explains that Chess.com works today for the beginner path plus No Castle Club.

## Verification

- `pnpm lint` ✅
- `pnpm build` ✅
- `vercel --prod --yes` ✅
  - Production deployment: `https://cc-ebstaftby-andreas-nordenadlers-projects.vercel.app`
  - Aliased to: `https://sidequestchess.com`
- Live smoke via Node `fetch` ✅
  - `https://cc-ebstaftby-andreas-nordenadlers-projects.vercel.app/verifiers` returned 200 and contained `4 quests`, `Dual-host coverage`, and `Lichess-only next`.
  - `https://cc-ebstaftby-andreas-nordenadlers-projects.vercel.app/beta` returned 200 and contained `4 dual-host quests`.
  - `https://cc-ebstaftby-andreas-nordenadlers-projects.vercel.app/connect` returned 200 and contained `beginner-path and No Castle Club checks today`.
  - `https://sidequestchess.com/verifiers`, `/beta`, and `/connect` returned 200 with the same content checks.
- Vercel production error log scan ✅
  - `vercel logs https://cc-ebstaftby-andreas-nordenadlers-projects.vercel.app --no-follow --level error --since 10m --limit 100`
  - Result: `No logs found for andreas-nordenadlers-projects/cc`.

## Notes

This is a product-trust/private-beta hardening pass, not a new verifier adapter. The user-visible effect is that beta testers can now see exactly what Chess.com supports today before entering a username or running the verifier board.
