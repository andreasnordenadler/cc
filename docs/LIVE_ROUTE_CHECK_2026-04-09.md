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
- `/account` -> 404 Not Found on the checked production URL during the 2026-04-10 re-check.

## Overall verdict

Partial pass. The main challenge browsing loop is live, but the full v0 route loop is still not healthy end to end on the checked production URL because `/account` is returning 404 in the re-check.

## Verification note

Re-checked live production routes on 2026-04-10 with `curl -L` against the exact URL above and verified the artifact locally with `test -f docs/LIVE_ROUTE_CHECK_2026-04-09.md`.
