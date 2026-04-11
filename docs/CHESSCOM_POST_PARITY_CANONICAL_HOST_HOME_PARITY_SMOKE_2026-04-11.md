# Chess.com Post-Parity Canonical-Host Home Parity Smoke, 2026-04-11

Date: 2026-04-11 18:42 CEST
Owner: Sam

## Scope

Record one fresh same-run dual-host smoke check of the shipped Chess.com-supported home entry surface after the dual-host auth/account parity proof.

## Live hosts checked

- Canonical host URL: `https://cc-andreas-nordenadlers-projects.vercel.app/`
- Active deployment host URL: `https://cc-taupe-kappa.vercel.app/`
- Checked in the same proof window at: 2026-04-11 18:42 CEST

## Results

### Canonical host

- HTTP status: `200`
- Matched path header: `/`
- Shipped wording present: yes

### Active deployment host

- HTTP status: `200`
- Matched path header: `/`
- Shipped wording present: yes

## Live wording proof

Both returned live HTML responses include the same shipped Chess.com-supported home-entry wording:

> `Your next chess challenge starts with your real game on Lichess or Chess.com.`

Additional same-run shared wording present on both hosts:

- `Play a real, complete game on Lichess or Chess.com and come back to check your result.`
- `Sign in and save your Lichess and/or Chess.com username in your account.`

## Verdict

Pass. During the same proof window, both the canonical production host and the active deployment host returned the `/` home route successfully with `x-matched-path: /` and exposed the same shipped Chess.com-supported home-entry wording, giving a narrow dual-host parity confirmation for the public entry surface.

## Verification

Verified live with:

```bash
python3 - <<'PY'
import urllib.request
urls = [
    ('canonical', 'https://cc-andreas-nordenadlers-projects.vercel.app/'),
    ('deployment', 'https://cc-taupe-kappa.vercel.app/'),
]
needles = [
    'Your next chess challenge starts with your real game on Lichess or Chess.com.',
    'Play a real, complete game on Lichess or Chess.com and come back to check your result.',
    'Sign in and save your Lichess and/or Chess.com username in your account.',
]
for label, url in urls:
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req, timeout=30) as r:
        body = r.read().decode('utf-8', 'replace')
        print(f'[{label}] url={url}')
        print(f'[{label}] status={r.status}')
        print(f'[{label}] matched={r.headers.get("x-matched-path")}')
        for i, needle in enumerate(needles, start=1):
            print(f'[{label}] needle{i}={needle in body}')
PY
```

This confirmed both exact URLs returned `200`, both matched `/`, and both exposed the quoted Chess.com-supported home-entry wording during the same proof run.
