# Chess.com Post-Parity Dual-Host Mixed-Surface Bundle Smoke

Date: 2026-04-11
Proof window: 2026-04-11 19:21:43 UTC to 2026-04-11 19:21:47 UTC (same-run dual-host fetch)

## Exact live URLs checked

### Canonical host
- `https://cc-andreas-nordenadlers-projects.vercel.app/`
- `https://cc-andreas-nordenadlers-projects.vercel.app/challenges/win-as-white`
- `https://cc-andreas-nordenadlers-projects.vercel.app/account`

### Active deployment host
- `https://cc-taupe-kappa.vercel.app/`
- `https://cc-taupe-kappa.vercel.app/challenges/win-as-white`
- `https://cc-taupe-kappa.vercel.app/account`

## Result

Dual-host mixed-surface bundle parity passed.

All six checks completed during the same proof window. The two representative public routes returned `200` on both hosts, and the signed-out protected `/account` route returned the same protected `404` shape on both hosts.

## Live response evidence

### Canonical host

- `/`
  - Status: `200`
  - `date`: `Sat, 11 Apr 2026 19:21:45 GMT`
  - `x-matched-path`: `/`
  - `x-vercel-id`: `arn1::iad1::q26rn-1775935303903-95d3b7b1ef19`
  - Visible text snippet:

```text
Chess Home Challenges Account Sign in Create account Your next chess challenge starts with your real game on Lichess or Chess.com. Play real games, verify the result automatically, and track your progress clearly.
```

- `/challenges/win-as-white`
  - Status: `200`
  - `date`: `Sat, 11 Apr 2026 19:21:45 GMT`
  - `x-matched-path`: `/challenges/[id]`
  - `x-vercel-id`: `arn1::iad1::v4gwq-1775935305763-9c730d178958`
  - Visible text snippet:

```text
Chess Home Challenges Account Sign in Create account ← Back to challenge list Challenge detail Win as White Win one complete game as White. Start a real game and play as White. Return with a finished game ID or Chess.com game URL. Lichess and Chess.com are supported here today.
```

- `/account`
  - Status: `404`
  - `date`: `Sat, 11 Apr 2026 19:21:46 GMT`
  - `x-matched-path`: `/404`
  - `x-vercel-id`: `arn1::xdf99-1775935306161-4d0d9374639e`
  - `x-clerk-auth-status`: `signed-out`
  - `x-clerk-auth-reason`: `protect-rewrite, dev-browser-missing`
  - Visible text snippet:

```text
404: This page could not be found. Chess 404 This page could not be found.
```

### Active deployment host

- `/`
  - Status: `200`
  - `date`: `Sat, 11 Apr 2026 19:21:46 GMT`
  - `x-matched-path`: `/`
  - `x-vercel-id`: `arn1::iad1::4lvv2-1775935306601-c2276fed6909`
  - Visible text snippet:

```text
Chess Home Challenges Account Sign in Create account Your next chess challenge starts with your real game on Lichess or Chess.com. Play real games, verify the result automatically, and track your progress clearly.
```

- `/challenges/win-as-white`
  - Status: `200`
  - `date`: `Sat, 11 Apr 2026 19:21:47 GMT`
  - `x-matched-path`: `/challenges/[id]`
  - `x-vercel-id`: `arn1::iad1::vp2nd-1775935306865-b0cf26d78094`
  - Visible text snippet:

```text
Chess Home Challenges Account Sign in Create account ← Back to challenge list Challenge detail Win as White Win one complete game as White. Start a real game and play as White. Return with a finished game ID or Chess.com game URL. Lichess and Chess.com are supported here today.
```

- `/account`
  - Status: `404`
  - `date`: `Sat, 11 Apr 2026 19:21:47 GMT`
  - `x-matched-path`: `/404`
  - `x-vercel-id`: `arn1::75w5c-1775935307141-7c6414929d61`
  - `x-clerk-auth-status`: `signed-out`
  - `x-clerk-auth-reason`: `protect-rewrite, dev-browser-missing`
  - Visible text snippet:

```text
404: This page could not be found. Chess 404 This page could not be found.
```

## Shared surface signals supporting the mixed-surface verdict

The same-run responses on both hosts exposed these shared mixed-surface signals:

- Home: `Your next chess challenge starts with your real game on Lichess or Chess.com.`
- Representative detail: `Return with a finished game ID or Chess.com game URL. Lichess and Chess.com are supported here today.`
- Signed-out protected route: `/account` returned `404` with `x-matched-path: /404`, `x-clerk-auth-status: signed-out`, and `x-clerk-auth-reason: protect-rewrite, dev-browser-missing` on both hosts.

## Parity verdict

The canonical host and active deployment host served the same representative mixed-surface bundle successfully in one proof window across `/`, `/challenges/win-as-white`, and signed-out `/account`. Public routes matched with shared Chess.com-supported wording, and the protected route matched with the same signed-out Clerk protection shape. This is a clean dual-host mixed-surface bundle parity pass.

## Verification

Verified live on 2026-04-11 by fetching all six exact URLs in one Python run and confirming the public `200` results plus the shared signed-out protected-route `404` shape during the same proof window.
