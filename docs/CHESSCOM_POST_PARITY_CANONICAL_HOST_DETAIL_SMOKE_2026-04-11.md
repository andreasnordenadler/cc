# Chess.com Post-Parity Canonical-Host Detail Smoke, 2026-04-11

Date: 2026-04-11 15:02 CEST
Owner: Sam

## Scope

Record one fresh live smoke check of the shipped Chess.com-supported representative challenge-detail route through the current canonical production host after the canonical-host home-route and `/challenges` route-family proofs.

## Production target checked

- Canonical host URL: `https://cc-andreas-nordenadlers-projects.vercel.app/challenges/win-as-white`
- Checked at: 2026-04-11 15:02 CEST
- Canonical host HTTP status: `200`

## Live wording proof

The returned live HTML on the canonical host still includes shipped Chess.com-supported representative detail wording:

> `Start a real game and play as White. Return with a finished game ID or Chess.com game URL. Lichess and Chess.com are supported here today.`

## Verdict

Pass. The current canonical production host representative detail route returned successfully and still shows the shipped Chess.com-supported submission wording on `/challenges/win-as-white`, extending canonical-host consistency proof from the home and challenge-list surfaces to one representative detail page.

## Verification

Verified live with:

```bash
curl -sS -D /tmp/cc_canonical_detail_headers.txt -o /tmp/cc_canonical_detail_body.html https://cc-andreas-nordenadlers-projects.vercel.app/challenges/win-as-white
awk 'NR==1 {print $2}' /tmp/cc_canonical_detail_headers.txt
python3 - <<'PY'
from pathlib import Path
text = Path('/tmp/cc_canonical_detail_body.html').read_text()
needle = 'Start a real game and play as White. Return with a finished game ID or Chess.com game URL. Lichess and Chess.com are supported here today.'
print(needle if needle in text else 'missing')
PY
```

This confirmed the canonical host returned `200` and exposed the quoted representative detail wording in the returned HTML.
