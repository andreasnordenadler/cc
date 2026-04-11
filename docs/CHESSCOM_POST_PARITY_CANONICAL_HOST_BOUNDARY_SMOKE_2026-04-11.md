# Chess.com Post-Parity Canonical-Host Boundary Smoke, 2026-04-11

Date: 2026-04-11 16:41 CEST
Owner: Sam

## Scope

Record one fresh live smoke check of the shipped Chess.com-supported boundary challenge-detail route through the current canonical production host after the canonical-host auth-surface proof.

## Production target checked

- Canonical host URL: `https://cc-andreas-nordenadlers-projects.vercel.app/challenges/lose-as-black`
- Checked at: 2026-04-11 16:41 CEST
- Canonical host HTTP status: `200`
- Matched path header: `/challenges/[id]`

## Live wording proof

The returned live HTML on the canonical host still includes shipped Chess.com-supported boundary detail wording:

> `Play a real game as Black, finish it with a loss, and return with the game ID or Chess.com game URL. Lichess and Chess.com are supported here today.`

## Verdict

Pass. The current canonical production host boundary detail route returned successfully and still shows the shipped Chess.com-supported submission wording on `/challenges/lose-as-black`, extending canonical-host consistency proof from the representative detail and auth-surface checks to the boundary edge of the shipped challenge set.

## Verification

Verified live with:

```bash
python3 - <<'PY'
import urllib.request
url='https://cc-andreas-nordenadlers-projects.vercel.app/challenges/lose-as-black'
req=urllib.request.Request(url, headers={'User-Agent':'Mozilla/5.0'})
with urllib.request.urlopen(req, timeout=30) as r:
    body=r.read().decode('utf-8','replace')
    print(r.status)
    print(r.headers.get('x-matched-path'))
    needle='Play a real game as Black, finish it with a loss, and return with the game ID or Chess.com game URL. Lichess and Chess.com are supported here today.'
    print(needle if needle in body else 'missing')
PY
```

This confirmed the canonical host returned `200`, matched `/challenges/[id]`, and exposed the quoted boundary detail wording in the returned HTML.
