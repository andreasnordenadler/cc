# Chess.com Post-Parity Canonical-Host Catalog-Integrity Smoke, 2026-04-11

Date: 2026-04-11 15:41 CEST
Owner: Sam

## Scope

Record one fresh live smoke check of the shipped Chess.com-supported challenge catalog through the current canonical production host after the canonical-host representative detail proof.

## Production target checked

- Canonical host URL: `https://cc-andreas-nordenadlers-projects.vercel.app/challenges`
- Checked at: 2026-04-11 15:41 CEST
- Canonical host HTTP status: `200`

## Live catalog proof

The returned live HTML on the canonical host still includes the shipped Chess.com-supported challenge-list wording:

> `Start with one simple run, then come back with a Lichess game ID or Chess.com game URL.`

The same response also exposed all eleven shipped challenge detail routes on the canonical host:

- `/challenges/draw-any-game`
- `/challenges/draw-as-black`
- `/challenges/draw-as-white`
- `/challenges/finish-any-game`
- `/challenges/finish-as-black`
- `/challenges/finish-as-white`
- `/challenges/lose-any-game`
- `/challenges/lose-as-black`
- `/challenges/lose-as-white`
- `/challenges/win-as-black`
- `/challenges/win-as-white`

## Verdict

Pass. The current canonical production host `/challenges` route returned successfully and still exposes the full shipped eleven-challenge Chess.com-supported catalog after the canonical-host representative detail proof.

## Verification

Verified live with:

```bash
curl -sS -D /tmp/cc_canonical_catalog_headers.txt -o /tmp/cc_canonical_catalog_body.html https://cc-andreas-nordenadlers-projects.vercel.app/challenges
awk 'NR==1 {print $2}' /tmp/cc_canonical_catalog_headers.txt
python3 - <<'PY'
from pathlib import Path
import re
text = Path('/tmp/cc_canonical_catalog_body.html').read_text()
needle = 'Start with one simple run, then come back with a Lichess game ID or Chess.com game URL.'
print('wording-present' if needle in text else 'wording-missing')
routes = sorted(set(re.findall(r'/challenges/[a-z0-9-]+', text)))
print(len(routes))
for route in routes:
    print(route)
PY
```

This confirmed the canonical host returned `200`, exposed the quoted Chess.com-supported challenge-list wording, and listed all eleven shipped challenge routes in the returned HTML.
