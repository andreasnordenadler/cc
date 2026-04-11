# Chess.com Post-Parity Canonical-Host Auth Parity Smoke, 2026-04-11

Date: 2026-04-11 18:01 CEST
Owner: Sam

## Scope

Record one fresh same-run dual-host smoke check of the shipped Chess.com-supported `/account` auth surface after the canonical-host auth parity next-step definition.

## Live hosts checked

- Canonical host URL: `https://cc-andreas-nordenadlers-projects.vercel.app/account`
- Active deployment host URL: `https://cc-taupe-kappa.vercel.app/account`
- Checked in the same proof window at: 2026-04-11 18:01 CEST

## Results

### Canonical host

- HTTP status: `404`
- Clerk auth status: `signed-out`
- Clerk auth reason: `protect-rewrite, dev-browser-missing`
- Matched path header: `/404`
- Signed-out protected 404 title present: yes
- Chess.com-aware metadata present: yes

### Active deployment host

- HTTP status: `404`
- Clerk auth status: `signed-out`
- Clerk auth reason: `protect-rewrite, dev-browser-missing`
- Matched path header: `/404`
- Signed-out protected 404 title present: yes
- Chess.com-aware metadata present: yes

## Live auth/account parity proof

Both returned the same signed-out protected-route response during the same proof window:

- `x-clerk-auth-status: signed-out`
- `x-clerk-auth-reason: protect-rewrite, dev-browser-missing`
- `x-matched-path: /404`
- response body title includes `404: This page could not be found.`

Both returned HTML responses also include the same shipped Chess.com-aware account-surface metadata:

> `<meta name="description" content="Play real games on Lichess or Chess.com and track challenge progress.">`

The shipped protected account route behind that auth surface still explicitly supports Chess.com setup in repo code:

- `src/app/account/page.tsx` includes the field label `Chess.com username`
- `src/middleware.ts` protects `/account(.*)` with `auth.protect()`

## Verdict

Pass. During the same proof window, both the canonical production host and the active deployment host returned the expected signed-out protected Clerk response on `/account`, and both exposed the same shipped Chess.com-aware account metadata, giving a narrow dual-host parity confirmation for the auth/account surface.

## Verification

Verified live with:

```bash
python3 - <<'PY'
import urllib.request
from datetime import datetime
urls = [
    ('canonical', 'https://cc-andreas-nordenadlers-projects.vercel.app/account'),
    ('deployment', 'https://cc-taupe-kappa.vercel.app/account'),
]
needle = 'Play real games on Lichess or Chess.com and track challenge progress.'
checked = datetime.now().astimezone().strftime('%Y-%m-%d %H:%M %Z')
print(f'checked_at={checked}')
for label, url in urls:
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            body = r.read().decode('utf-8', 'replace')
            print(f'[{label}] url={url}')
            print(f'[{label}] status={r.status}')
            print(f'[{label}] x-clerk-auth-status={r.headers.get("x-clerk-auth-status")}')
            print(f'[{label}] x-clerk-auth-reason={r.headers.get("x-clerk-auth-reason")}')
            print(f'[{label}] x-matched-path={r.headers.get("x-matched-path")}')
            print(f'[{label}] title_404={"404: This page could not be found." in body}')
            print(f'[{label}] chess_meta_present={needle in body}')
    except urllib.error.HTTPError as e:
        body = e.read().decode('utf-8', 'replace')
        print(f'[{label}] url={url}')
        print(f'[{label}] status={e.code}')
        print(f'[{label}] x-clerk-auth-status={e.headers.get("x-clerk-auth-status")}')
        print(f'[{label}] x-clerk-auth-reason={e.headers.get("x-clerk-auth-reason")}')
        print(f'[{label}] x-matched-path={e.headers.get("x-matched-path")}')
        print(f'[{label}] title_404={"404: This page could not be found." in body}')
        print(f'[{label}] chess_meta_present={needle in body}')
PY
```

This confirmed both exact URLs returned `404`, both emitted the same quoted Clerk protection headers, both rendered the same protected 404 title, and both exposed the quoted Chess.com-aware metadata in the same proof run. I also re-checked the shipped account route implementation in `src/app/account/page.tsx` plus `src/middleware.ts`.
