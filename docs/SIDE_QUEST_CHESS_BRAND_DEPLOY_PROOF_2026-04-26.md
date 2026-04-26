# Side Quest Chess brand deploy proof

Date: 2026-04-26 Europe/Stockholm  
Commit: `0d4e37f` (`Adopt Side Quest Chess production name`)

## Scope

Applied Andreas's production naming decision to the CC app and docs:

- Production name: **Side Quest Chess**
- Primary domain: `sidequestchess.com`
- Backup domain: `sqchess.com`
- Former working/mockup name: BlunderCheck
- Internal repo/lane name: CC

## Local verification

- `pnpm lint` passed
- `pnpm build` passed
- Local route smoke via Python urllib on `http://localhost:3011` passed for:
  - `/`
  - `/challenges`
  - `/challenges/queen-never-heard-of-her`
  - `/connect`
  - `/result`
  - `/account`

Each route returned HTTP 200, contained `Side Quest Chess`, and contained 0 `BlunderCheck` user-facing markers.

## Production deploy

Vercel production deployment:

- `https://cc-manhu6pho-andreas-nordenadlers-projects.vercel.app`
- aliased to `https://cc-taupe-kappa.vercel.app`

## Production smoke

Both production hosts returned HTTP 200 for:

- `/`
- `/challenges`
- `/challenges/queen-never-heard-of-her`
- `/connect`
- `/result`
- `/account`

Each checked route contained `Side Quest Chess` and 0 `BlunderCheck` user-facing markers.

Vercel 500-log scan:

- `vercel logs https://cc-manhu6pho-andreas-nordenadlers-projects.vercel.app --no-follow --status-code 500 --since 15m`
- Result: no logs found.

## Domain status

`sidequestchess.com` and `sqchess.com` are documented as the chosen domains but are **not yet claimed live** here. Phase 9 remains open to wire DNS/Vercel domain configuration and smoke-verify the primary domain.
