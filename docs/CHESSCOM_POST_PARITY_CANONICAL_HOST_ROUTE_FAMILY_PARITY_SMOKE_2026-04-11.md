# Chess.com Post-Parity Canonical-Host Route-Family Parity Smoke, 2026-04-11

Date: 2026-04-11 19:21 CEST
Owner: Sam

## Scope

Record one fresh same-run dual-host smoke check of the shipped Chess.com-supported challenge-list surface after the dual-host home parity proof.

## Live hosts checked

- Canonical host URL: `https://cc-andreas-nordenadlers-projects.vercel.app/challenges`
- Active deployment host URL: `https://cc-taupe-kappa.vercel.app/challenges`
- Checked in the same proof window at: 2026-04-11 19:21 CEST

## Results

### Canonical host

- HTTP status: `200`
- Matched path header: `/challenges`
- Shipped wording present: yes
- Eleven shipped challenge routes visible: yes

### Active deployment host

- HTTP status: `200`
- Matched path header: `/challenges`
- Shipped wording present: yes
- Eleven shipped challenge routes visible: yes

## Live wording proof

Both returned live HTML responses include the shipped Chess.com-supported challenge-list wording:

> `Paste a finished Lichess or Chess.com game URL to see which challenges you completed.`

Additional same-run shared evidence present on both hosts:

- `Chess.com`
- `game URL`
- `/challenges/win-as-white`
- `/challenges/lose-as-black`
- `/challenges/finish-any-game`

Both same-run responses also exposed the full eleven-route shipped challenge catalog:

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

Pass. During the same proof window, both the canonical production host and the active deployment host returned the `/challenges` route successfully with `x-matched-path: /challenges`, exposed the shipped Chess.com-supported challenge-list wording, and showed the same eleven-route challenge catalog, giving a narrow dual-host parity confirmation for the route-family surface.

## Verification

Verified live with:

```bash
python3 - <<'PY'
import urllib.request, re
urls = [
    ('canonical', 'https://cc-andreas-nordenadlers-projects.vercel.app/challenges'),
    ('deployment', 'https://cc-taupe-kappa.vercel.app/challenges'),
]
needles = [
    'Paste a finished Lichess or Chess.com game URL to see which challenges you completed.',
    'Chess.com',
    'game URL',
    '/challenges/win-as-white',
    '/challenges/lose-as-black',
    '/challenges/finish-any-game',
]
for label, url in urls:
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req, timeout=30) as r:
        body = r.read().decode('utf-8', 'replace')
        routes = sorted(set(re.findall(r'/challenges/[a-z0-9-]+', body)))
        print(f'[{label}] url={url}')
        print(f'[{label}] status={r.status}')
        print(f'[{label}] matched={r.headers.get("x-matched-path")}')
        print(f'[{label}] route_count={len(routes)}')
        for i, needle in enumerate(needles, start=1):
            print(f'[{label}] needle{i}={needle in body}')
PY
```

This confirmed both exact URLs returned `200`, both matched `/challenges`, both exposed the quoted Chess.com-supported challenge-list wording, and both showed the same eleven challenge routes during the same proof run.
