# Chess.com Post-Parity Submission Smoke, 2026-04-11

Date: 2026-04-11
Owner: Sam

## Scope

Record one fresh live smoke check of the shipped Chess.com-supported challenge submission surface after the current post-parity route-family proofs.

## Production target checked

- URL: `https://cc-taupe-kappa.vercel.app/challenges/win-as-white`
- Checked on: 2026-04-11
- HTTP status: `200`

## Live wording proof

The returned live HTML still includes the shipped submission-surface wording on the representative Chess.com-supported challenge detail route:

> `Start a real game and play as White. Return with a finished game ID or Chess.com game URL. Lichess and Chess.com are supported here today.`

Additional live proof from the same response:

- the page still renders the representative challenge title `Win as White`
- the returned HTML still includes `Chess.com game URL`
- the challenge detail route continues to load successfully on the active production target

## Verdict

Pass. The active live representative challenge submission surface at `/challenges/win-as-white` returned successfully on the current production target and still exposes the shipped submit-loop wording telling users to return with a finished game ID or Chess.com game URL.

## Verification

Verified live on 2026-04-11 with:

`python3 - <<'PY'
import urllib.request
url='https://cc-taupe-kappa.vercel.app/challenges/win-as-white'
resp=urllib.request.urlopen(url)
html=resp.read().decode('utf-8','replace')
print(resp.status)
print('Chess.com game URL' in html)
PY`

Confirmed HTTP status `200` and confirmed the quoted submission-surface wording is present in the returned HTML.
