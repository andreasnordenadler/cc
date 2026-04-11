# Chess.com Post-Parity Dual-Host Mixed-Surface Expanded Bundle Smoke

Date: 2026-04-11
Proof window: 2026-04-11 20:02:04 UTC to 2026-04-11 20:02:06 UTC (same-run dual-host fetch)

## Exact live URLs checked

### Canonical host
- `https://cc-andreas-nordenadlers-projects.vercel.app/`
- `https://cc-andreas-nordenadlers-projects.vercel.app/challenges`
- `https://cc-andreas-nordenadlers-projects.vercel.app/challenges/win-as-white`
- `https://cc-andreas-nordenadlers-projects.vercel.app/account`

### Active deployment host
- `https://cc-taupe-kappa.vercel.app/`
- `https://cc-taupe-kappa.vercel.app/challenges`
- `https://cc-taupe-kappa.vercel.app/challenges/win-as-white`
- `https://cc-taupe-kappa.vercel.app/account`

## Result

Dual-host expanded mixed-surface bundle parity passed.

All eight checks completed during the same proof window. The three public routes returned `200` on both hosts, and the signed-out protected `/account` route returned the same protected `404` shape on both hosts.

## Live response evidence

### Canonical host

- `/`
  - Status: `200`
  - `date`: `Sat, 11 Apr 2026 20:02:05 GMT`
  - `x-matched-path`: `/`
  - `x-vercel-id`: `arn1::iad1::z6n9h-1775937724782-6be2b4e6b562`
  - `x-clerk-auth-status`: `signed-out`
  - `x-clerk-auth-reason`: `dev-browser-missing`
  - Visible text snippet:

```text
Chess Home Challenges Account Sign in Create account Your next chess challenge starts with your real game on Lichess or Chess.com. Play real games, verify the result automatically, and track your progress clearly.
```

- `/challenges`
  - Status: `200`
  - `date`: `Sat, 11 Apr 2026 20:02:05 GMT`
  - `x-matched-path`: `/challenges`
  - `x-vercel-id`: `arn1::iad1::vhqds-1775937725150-075fbdddc3bc`
  - `x-clerk-auth-status`: `signed-out`
  - `x-clerk-auth-reason`: `dev-browser-missing`
  - Visible text snippet:

```text
Chess Home Challenges Account Sign in Create account Challenges Pick a real game challenge Start with one simple run, then come back with a Lichess game ID or Chess.com game URL.
```

- `/challenges/win-as-white`
  - Status: `200`
  - `date`: `Sat, 11 Apr 2026 20:02:05 GMT`
  - `x-matched-path`: `/challenges/[id]`
  - `x-vercel-id`: `arn1::iad1::ckn7t-1775937725422-54066887b078`
  - `x-clerk-auth-status`: `signed-out`
  - `x-clerk-auth-reason`: `dev-browser-missing`
  - Visible text snippet:

```text
Chess Home Challenges Account Sign in Create account ← Back to challenge list Challenge detail Win as White Win one complete game as White. Start a real game and play as White. Return with a finished game ID or Chess.com game URL. Lichess and Chess.com are supported here today.
```

- `/account`
  - Status: `404`
  - `date`: `Sat, 11 Apr 2026 20:02:05 GMT`
  - `x-matched-path`: `/404`
  - `x-vercel-id`: `arn1::2f9fg-1775937725682-810ebc9d8708`
  - `x-clerk-auth-status`: `signed-out`
  - `x-clerk-auth-reason`: `protect-rewrite, dev-browser-missing`
  - Visible text snippet:

```text
404: This page could not be found. Chess 404 This page could not be found.
```

### Active deployment host

- `/`
  - Status: `200`
  - `date`: `Sat, 11 Apr 2026 20:02:05 GMT`
  - `x-matched-path`: `/`
  - `x-vercel-id`: `arn1::iad1::q46tt-1775937725812-5fd5269ac1b9`
  - `x-clerk-auth-status`: `signed-out`
  - `x-clerk-auth-reason`: `dev-browser-missing`
  - Visible text snippet:

```text
Chess Home Challenges Account Sign in Create account Your next chess challenge starts with your real game on Lichess or Chess.com. Play real games, verify the result automatically, and track your progress clearly.
```

- `/challenges`
  - Status: `200`
  - `date`: `Sat, 11 Apr 2026 20:02:06 GMT`
  - `x-matched-path`: `/challenges`
  - `x-vercel-id`: `arn1::iad1::tbc2k-1775937726368-66e1e51fbdea`
  - `x-clerk-auth-status`: `signed-out`
  - `x-clerk-auth-reason`: `dev-browser-missing`
  - Visible text snippet:

```text
Chess Home Challenges Account Sign in Create account Challenges Pick a real game challenge Start with one simple run, then come back with a Lichess game ID or Chess.com game URL.
```

- `/challenges/win-as-white`
  - Status: `200`
  - `date`: `Sat, 11 Apr 2026 20:02:06 GMT`
  - `x-matched-path`: `/challenges/[id]`
  - `x-vercel-id`: `arn1::iad1::gwzrv-1775937726642-7b13a458c6e1`
  - `x-clerk-auth-status`: `signed-out`
  - `x-clerk-auth-reason`: `dev-browser-missing`
  - Visible text snippet:

```text
Chess Home Challenges Account Sign in Create account ← Back to challenge list Challenge detail Win as White Win one complete game as White. Start a real game and play as White. Return with a finished game ID or Chess.com game URL. Lichess and Chess.com are supported here today.
```

- `/account`
  - Status: `404`
  - `date`: `Sat, 11 Apr 2026 20:02:06 GMT`
  - `x-matched-path`: `/404`
  - `x-vercel-id`: `arn1::z5zkj-1775937726907-66c74b61f5c2`
  - `x-clerk-auth-status`: `signed-out`
  - `x-clerk-auth-reason`: `protect-rewrite, dev-browser-missing`
  - Visible text snippet:

```text
404: This page could not be found. Chess 404 This page could not be found.
```

## Shared surface signals supporting the expanded mixed-surface verdict

The same-run responses on both hosts exposed these shared expanded mixed-surface signals:

- Home: `Your next chess challenge starts with your real game on Lichess or Chess.com.`
- Challenge list: `Start with one simple run, then come back with a Lichess game ID or Chess.com game URL.`
- Representative detail: `Return with a finished game ID or Chess.com game URL. Lichess and Chess.com are supported here today.`
- Signed-out protected route: `/account` returned `404` with `x-matched-path: /404`, `x-clerk-auth-status: signed-out`, and `x-clerk-auth-reason: protect-rewrite, dev-browser-missing` on both hosts.

## Parity verdict

The canonical host and active deployment host served the same expanded mixed-surface bundle successfully in one proof window across `/`, `/challenges`, `/challenges/win-as-white`, and signed-out `/account`. The three public routes matched with shared Chess.com-supported wording, and the protected route matched with the same signed-out Clerk protection shape. This is a clean dual-host expanded mixed-surface bundle parity pass.

## Verification

Verified live on 2026-04-11 by fetching all eight exact URLs in one Python run and confirming the public `200` results plus the shared signed-out protected-route `404` shape during the same proof window.
