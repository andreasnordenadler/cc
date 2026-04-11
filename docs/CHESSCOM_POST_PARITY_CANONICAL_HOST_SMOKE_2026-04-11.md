# Chess.com Post-Parity Canonical-Host Smoke, 2026-04-11

Date: 2026-04-11 13:40 CEST
Owner: Sam

## Scope

Record one fresh live smoke check of the shipped Chess.com-supported home entry surface through the current canonical production host after the current deployment-host post-parity proof chain.

## Production target checked

- Canonical host URL: `https://cc-andreas-nordenadlers-projects.vercel.app/`
- Deployment-host comparison URL: `https://cc-taupe-kappa.vercel.app/`
- Checked at: 2026-04-11 13:40 CEST
- Canonical host HTTP status: `200`
- Deployment-host HTTP status: `200`

## Live wording proof

The returned live HTML on the canonical host still includes the shipped Chess.com-supported home-entry copy:

> `Your next chess challenge starts with your real game on Lichess or Chess.com.`

Comparison proof from the same run:

- the same quoted wording was also present on `https://cc-taupe-kappa.vercel.app/`
- both hosts returned the same visible Chess.com-supported home-entry sentence during the same check window

## Verdict

Pass. The current canonical production host root returned successfully and still shows the shipped Chess.com-supported home entry wording, matching the current deployment-host proof and extending the post-parity evidence from deployment-host integrity to canonical-host consistency.

## Verification

Verified live with:

```bash
for url in https://cc-andreas-nordenadlers-projects.vercel.app/ https://cc-taupe-kappa.vercel.app/; do
  curl -sS -D /tmp/cc_headers.txt -o /tmp/cc_body.html "$url"
  awk 'NR==1 {print $2}' /tmp/cc_headers.txt
  grep -o "Your next chess challenge starts with your real game on Lichess or Chess.com\." /tmp/cc_body.html | head -n 1
done
```

This confirmed both hosts returned `200` and exposed the quoted home-entry wording in the returned HTML.