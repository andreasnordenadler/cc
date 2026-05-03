# SQC Support Copyable Packet — Live Deploy (2026-05-03)

## Change

Added a copyable support packet to `/support` so friends/private-beta testers can paste one diagnosable note when they hit a rough edge.

The packet captures:
- quest
- chess site
- public username
- game link
- receipt outcome
- confusing moment
- expected result
- screenshot status

## Why

The private beta now routes more testers through public-game verification. When receipts or setup moments feel wrong, Andreas needs lightweight reports that still include enough context for Sam to reproduce or fix the issue quickly.

## Verification

- `pnpm install --frozen-lockfile` ✅
- `pnpm lint` ✅
- `pnpm build` ✅
- Production deploy ✅
  - Deploy URL: `https://cc-ha6qrn5cb-andreas-nordenadlers-projects.vercel.app`
  - Canonical alias: `https://sidequestchess.com`
- Live smoke ✅
  - `https://cc-ha6qrn5cb-andreas-nordenadlers-projects.vercel.app/support` returned HTTP 200
  - `https://sidequestchess.com/support` returned HTTP 200
  - `https://sidequestchess.com/` returned HTTP 200
  - `https://sidequestchess.com/beta` returned HTTP 200
- Live content assertions on canonical `/support` ✅
  - `Copyable support packet`
  - `Side Quest Chess beta support note`
  - `Receipt outcome: passed / failed / pending / did not reach receipt`
  - `Screenshot attached: yes / no`
  - `diagnosable fast`
- Vercel logs check: attempted bounded check; this CLI version rejected `--since`, and the fallback follow produced no output before timeout/kill.

## Impact

Private-beta support is now easier to collect without making friends reconstruct the whole run from memory.
