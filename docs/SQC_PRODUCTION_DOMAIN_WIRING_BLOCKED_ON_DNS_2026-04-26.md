# SQC production domain wiring — live primary domain verified

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

## 2026-04-26 19:42 Europe/Stockholm recheck

- `pnpm lint` ✅
- `pnpm build` ✅
- Public DNS still does **not** reach Vercel:
  - `sidequestchess.com` A → `76.223.105.230`, `13.248.243.5`; `curl` serves GoDaddy `DPS/2.0.0`, not the SQC app.
  - `www.sidequestchess.com` CNAME → `sidequestchess.com`; follows to GoDaddy parking.
  - `sqchess.com` A → `15.197.148.33`, `3.33.130.190`; still GoDaddy/default parking records.
  - `www.sqchess.com` CNAME → `sqchess.com`; still not Vercel.
- Vercel domain inspection still shows all four domains attached to the `cc` project, but nameservers remain at GoDaddy (`domaincontrol.com`) and Vercel reports each domain as not configured properly.
- Vercel's recommended per-host record remains: `A <host> 76.76.21.21` for `sidequestchess.com`, `www.sidequestchess.com`, `sqchess.com`, and `www.sqchess.com`; nameserver alternative remains `ns1.vercel-dns.com` / `ns2.vercel-dns.com`.

Conclusion: Phase 10 remains blocked only on registrar/DNS changes; the app build and Vercel-side project attachment are healthy.

## Next step

Update the DNS at the registrar/DNS provider. After propagation, rerun:

```bash
curl -I -L -A 'Mozilla/5.0' https://sidequestchess.com/
curl -I -L -A 'Mozilla/5.0' https://www.sidequestchess.com/challenges
curl -I -L -A 'Mozilla/5.0' https://sqchess.com/challenges
curl -I -L -A 'Mozilla/5.0' https://www.sqchess.com/challenges
```

Then mark Phase 10 complete only after `https://sidequestchess.com/` serves the Side Quest Chess app and backup hosts redirect correctly.

## 2026-04-26 20:44 Europe/Stockholm recheck + DNS correction burst

Changed Vercel DNS for the primary domain from the parked GoDaddy/DPS target to explicit Vercel app records:

- Added `A @ 76.76.21.21` for `sidequestchess.com` (`rec_b8a8a1e6034d091fdd434b49`).
- Added `CNAME www cname.vercel-dns.com` for `www.sidequestchess.com` (`rec_113fed109169edd69cb899cc`).
- Verified Vercel authoritative DNS now returns:
  - `sidequestchess.com` A → `76.76.21.21`
  - `www.sidequestchess.com` CNAME → `cname.vercel-dns.com`
- Verified Cloudflare public resolver `1.1.1.1` now returns:
  - `sidequestchess.com` A → `76.76.21.21`
  - `www.sidequestchess.com` CNAME → `cname.vercel-dns.com`
- Verified the Vercel edge serves the Side Quest Chess app for the primary host by pinning DNS to `76.76.21.21`:
  - `/` ✅ contains `Side Quest Chess`
  - `/challenges` ✅ contains `Side Quest Chess`
  - `/challenges/queen-never-heard-of-her` ✅ contains `Side Quest Chess`
  - `/connect` ✅ contains `Side Quest Chess`
  - `/account` ✅ contains `Side Quest Chess`
  - `/result` ✅ contains `Side Quest Chess`
  - `www.sidequestchess.com` ✅ returns Vercel `308` to `https://sidequestchess.com/`
- Verification rerun:
  - `pnpm lint` ✅
  - `pnpm build` ✅

Remaining caveats:

- The local resolver path used by this Mac still returned cached GoDaddy/DPS content immediately after the DNS correction, even though authoritative Vercel DNS and `1.1.1.1` were already correct. Treat this as propagation/cache lag and re-smoke without pinned DNS before final closure.
- `sqchess.com` is intentionally **not** a Vercel-hosted backup per Andreas's 2026-04-26 20:23 clarification; it should remain a simple GoDaddy redirect to `sidequestchess.com`. A mistaken re-add during this burst was immediately undone with `vercel domains remove sqchess.com --yes`, and `vercel alias list` again shows only `sidequestchess.com` / `www.sidequestchess.com` for the SQC custom domains.

Conclusion: primary-domain DNS has been corrected and Vercel-edge smoke passes; Phase 10 remains open only until unpinned public smoke is clean and the GoDaddy-side `sqchess.com` redirect is confirmed separately.

## 2026-04-26 21:45 Europe/Stockholm recheck

- Re-verified project health after the primary DNS correction:
  - `pnpm lint` ✅
  - `pnpm build` ✅
- Public resolver state now shows the primary domain on Vercel nameservers:
  - `sidequestchess.com` NS → `ns1.vercel-dns.com`, `ns2.vercel-dns.com`
  - `sidequestchess.com` A → `216.198.79.1`
- Vercel-edge pinned smoke passes for the primary domain at the currently published Vercel A record (`216.198.79.1`):
  - `/` ✅ contains `Side Quest Chess`
  - `/challenges` ✅ contains `Side Quest Chess`
  - `/challenges/queen-never-heard-of-her` ✅ contains `Side Quest Chess`
  - `/connect` ✅ contains `Side Quest Chess`
  - `/account` ✅ contains `Side Quest Chess`
  - `/result` ✅ contains `Side Quest Chess`
  - `www.sidequestchess.com` ✅ returns Vercel `308` toward `https://sidequestchess.com/` when pinned to the Vercel edge.
- Local macOS resolver cache still returns old GoDaddy/DPS addresses for `sidequestchess.com` (`76.223.105.230`, `13.248.243.5`), so unpinned local `curl` can still hit the parked GoDaddy page even though public DNS and Vercel edge are correct.
- Confirmed the backup `sqchess.com` remains outside Vercel and on GoDaddy nameservers (`ns09.domaincontrol.com`, `ns10.domaincontrol.com`) as intended for the simple registrar-side redirect path. A brief accidental re-add to Vercel during this recheck was removed immediately; `vercel domains inspect sqchess.com` now returns not found again.

Conclusion: primary domain wiring is healthy at public DNS/Vercel-edge level, but Phase 10 remains open until unpinned `https://sidequestchess.com/` smoke is clean from this environment and the GoDaddy-side `sqchess.com` redirect is confirmed.



## 2026-04-26 22:48 Europe/Stockholm completion recheck

- Re-verified project health:
  - `pnpm lint` ✅
  - `pnpm build` ✅
- DNS is now clean from this environment and Cloudflare public resolver:
  - `sidequestchess.com` A → `216.198.79.1`
- Unpinned live primary smoke now passes without resolver pinning:
  - `https://sidequestchess.com/` ✅ contains `Side Quest Chess`
  - `/challenges` ✅ contains `Side Quest Chess`
  - `/challenges/queen-never-heard-of-her` ✅ contains `Side Quest Chess`
  - `/connect` ✅ contains `Side Quest Chess`
  - `/account` ✅ contains `Side Quest Chess`
  - `/result` ✅ contains `Side Quest Chess`
- Canonical host redirect passes:
  - `https://www.sidequestchess.com/challenges` → `308` → `https://sidequestchess.com/challenges` → `200`
- Backup domain behavior is confirmed as intentionally GoDaddy-side forwarding, not Vercel hosting:
  - `https://sqchess.com/` → `301` → `http://sidequestchess.com` → Vercel canonical redirect → `200` live SQC app
  - `HEAD https://sqchess.com/challenges` returns `405`, so use GET-based checks for GoDaddy forwarding.

Conclusion: Phase 10 is complete. `sidequestchess.com` is the live primary production domain, `www.sidequestchess.com` canonicalizes to it, and `sqchess.com` forwards to it as the simple backup domain path.
