# Chess.com Post-Parity Canonical-Host Parity Smoke, 2026-04-11

Date: 2026-04-11 17:21 CEST
Owner: Sam

## Scope

Record one fresh same-run dual-host smoke check of the shipped Chess.com-supported boundary challenge-detail route after the canonical-host boundary proof.

## Live hosts checked

- Canonical host URL: `https://cc-andreas-nordenadlers-projects.vercel.app/challenges/lose-as-black`
- Active deployment host URL: `https://cc-taupe-kappa.vercel.app/challenges/lose-as-black`
- Checked in the same proof window at: 2026-04-11 17:21 CEST

## Results

### Canonical host

- HTTP status: `200`
- Matched path header: `/challenges/[id]`
- Shipped wording present: yes

### Active deployment host

- HTTP status: `200`
- Matched path header: `/challenges/[id]`
- Shipped wording present: yes

## Live wording proof

Both returned live HTML responses include the same shipped Chess.com-supported boundary detail wording:

> `Play a real game as Black, finish it with a loss, and return with the game ID or Chess.com game URL. Lichess and Chess.com are supported here today.`

## Verdict

Pass. During the same proof window, both the canonical production host and the active deployment host returned the `/challenges/lose-as-black` boundary detail route successfully and exposed the same shipped Chess.com-supported submission wording, giving a narrow dual-host parity confirmation for the boundary page.

## Verification

Verified live with:

```bash
python3 - <<'PY'
import urllib.request
urls = [
    ('canonical', 'https://cc-andreas-nordenadlers-projects.vercel.app/challenges/lose-as-black'),
    ('deployment', 'https://cc-taupe-kappa.vercel.app/challenges/lose-as-black'),
]
needle='Play a real game as Black, finish it with a loss, and return with the game ID or Chess.com game URL. Lichess and Chess.com are supported here today.'
for label, url in urls:
    req=urllib.request.Request(url, headers={'User-Agent':'Mozilla/5.0'})
    with urllib.request.urlopen(req, timeout=30) as r:
        body=r.read().decode('utf-8','replace')
        print(f'[{label}] url={url}')
        print(f'[{label}] status={r.status}')
        print(f'[{label}] matched={r.headers.get("x-matched-path")}')
        print(f'[{label}] wording_present={needle in body}')
PY
```

This confirmed both exact URLs returned `200`, both matched `/challenges/[id]`, and both exposed the quoted Chess.com-supported boundary detail wording in the same proof run.
