# CC Live Route Check

Date: 2026-04-10
Checked by: Sam
Deployment target: production
Exact live URL checked: https://cc-andreas-nordenadlers-projects.vercel.app
Production aliases observed:
- https://cc-git-main-andreas-nordenadlers-projects.vercel.app
- https://cc-taupe-kappa.vercel.app

## Route verdicts

- `/` -> 200 OK on the checked production URL.
- `/challenges` -> 200 OK on the checked production URL.
- `/challenges/mate-in-one` -> 200 OK on the checked production URL.
- `/account` -> mixed result depending on context:
  - authenticated Chrome session on the Mac mini loaded successfully at `https://cc-andreas-nordenadlers-projects.vercel.app/account` and rendered the signed-in account screen (`AUTHENTICATED ACCOUNT`, saved username visible) during the 2026-04-10 17:09 Europe/Stockholm re-check.
  - signed-out/raw `curl -I -L` requests still returned `HTTP/2 404` with Clerk headers including `x-clerk-auth-reason: protect-rewrite, dev-browser-missing` and `x-matched-path: /404`.

## Overall verdict

Usable pass for the current product loop. The authenticated browser route loop is working, so `/account` is not a live product blocker. The remaining issue is narrower: signed-out/non-browser access to the protected `/account` route still presents as a Clerk-managed 404 instead of a cleaner auth handoff.

## Verification note

Re-checked live production routes on 2026-04-10 using both direct HTTP checks and the authenticated Google Chrome session on the Mac mini, then verified the artifact locally with `test -f docs/LIVE_ROUTE_CHECK_2026-04-09.md`.
