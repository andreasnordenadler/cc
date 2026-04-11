# Chess.com Post-Parity Canonical-Host Route-Family Smoke, 2026-04-11

Date: 2026-04-11 14:21 CEST
Owner: Sam

## Scope

Record one fresh live smoke check of the shipped Chess.com-supported challenge-list route through the current canonical production host after the canonical-host home-route proof.

## Production target checked

- Canonical host URL: `https://cc-andreas-nordenadlers-projects.vercel.app/challenges`
- Checked at: 2026-04-11 14:21 CEST
- Canonical host HTTP status: `200`

## Live wording proof

The returned live HTML on the canonical host still includes shipped Chess.com-supported challenge-list wording:

> `Start with one simple run, then come back with a Lichess game ID or Chess.com game URL.`

## Verdict

Pass. The current canonical production host `/challenges` route returned successfully and still shows the shipped Chess.com-supported challenge-list wording, extending canonical-host consistency proof from the home route to the challenge-list route family.

## Verification

Verified live with:

```bash
curl -sS -D /tmp/cc_canonical_route_headers.txt -o /tmp/cc_canonical_route_body.html https://cc-andreas-nordenadlers-projects.vercel.app/challenges
awk 'NR==1 {print $2}' /tmp/cc_canonical_route_headers.txt
grep -o 'Start with one simple run, then come back with a Lichess game ID or Chess.com game URL\.' /tmp/cc_canonical_route_body.html | head -n 1
```

This confirmed the canonical host returned `200` and exposed the quoted challenge-list wording in the returned HTML.
