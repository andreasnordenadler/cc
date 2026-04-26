# SQC production domain wiring — Vercel configured, blocked on DNS

Date: 2026-04-26 17:46 Europe/Stockholm  
Project: CC / Side Quest Chess

## What changed

- Added the Side Quest Chess production domains to the Vercel `cc` project:
  - `sidequestchess.com`
  - `www.sidequestchess.com`
  - `sqchess.com`
  - `www.sqchess.com`
- Updated app metadata to use `https://sidequestchess.com` as the canonical metadata base.
- Updated Chess.com API user-agent contact URL from the temporary `cc-taupe-kappa.vercel.app` alias to `https://sidequestchess.com`.
- Added host redirects so, once DNS reaches Vercel, these hosts redirect to the primary domain:
  - `www.sidequestchess.com` → `https://sidequestchess.com/:path*`
  - `sqchess.com` → `https://sidequestchess.com/:path*`
  - `www.sqchess.com` → `https://sidequestchess.com/:path*`

## Verification

- `pnpm lint` ✅
- `pnpm build` ✅
- Production deploy ✅
  - Vercel deployment: `https://cc-a0tw4oo49-andreas-nordenadlers-projects.vercel.app`
  - Vercel reported aliases/cert generation for `sidequestchess.com`, `www.sidequestchess.com`, `sqchess.com`, and `www.sqchess.com`.
- Temporary deployment smoke ✅
  - `/` contains Side Quest Chess
  - `/challenges` contains `Pick your next bad idea`
  - `/challenges/queen-never-heard-of-her` contains `Queen? Never Heard of Her`
  - `/result` route returns expected Side Quest Chess proof surface
- Redirect rule probe ✅
  - Host-header probes for `www.sidequestchess.com`, `sqchess.com`, and `www.sqchess.com` returned `308` to `https://sidequestchess.com/challenges` on the Vercel deployment.

## Current blocker

The domains are configured in Vercel, but public DNS is still pointed at GoDaddy parking/DPS records, not Vercel.

Current DNS observed:

- `sidequestchess.com` A → `76.223.105.230`, `13.248.243.5`
- `www.sidequestchess.com` CNAME → `sidequestchess.com`
- `sqchess.com` A → `15.197.148.33`, `3.33.130.190`
- `www.sqchess.com` CNAME → `sqchess.com`

Vercel requested DNS:

- `A sidequestchess.com 76.76.21.21`
- `A www.sidequestchess.com 76.76.21.21`
- `A sqchess.com 76.76.21.21`
- `A www.sqchess.com 76.76.21.21`

Alternative: switch nameservers to Vercel:

- `ns1.vercel-dns.com`
- `ns2.vercel-dns.com`

## Next step

Update the DNS at the registrar/DNS provider. After propagation, rerun:

```bash
curl -I -L -A 'Mozilla/5.0' https://sidequestchess.com/
curl -I -L -A 'Mozilla/5.0' https://www.sidequestchess.com/challenges
curl -I -L -A 'Mozilla/5.0' https://sqchess.com/challenges
curl -I -L -A 'Mozilla/5.0' https://www.sqchess.com/challenges
```

Then mark Phase 10 complete only after `https://sidequestchess.com/` serves the Side Quest Chess app and backup hosts redirect correctly.
