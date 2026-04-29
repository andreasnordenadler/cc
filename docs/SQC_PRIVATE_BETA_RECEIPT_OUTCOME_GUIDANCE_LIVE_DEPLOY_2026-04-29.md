# Side Quest Chess — private beta receipt outcome guidance live deploy

Date: 2026-04-29 17:52 Europe/Stockholm
Scope: bounded autonomous CC / Side Quest Chess private-beta clarity burst

## What changed

Added an `/beta` “After the receipt” section so private-beta testers know what to do after each verification outcome instead of treating failed or pending receipts as dead ends.

## User-visible behavior

The private beta page now explains:

- `Passed` → share the proof card/link/screenshot.
- `Failed` → check whether the failure explanation felt fair and only report confusing or wrong failures.
- `Pending` → send the public username and latest game link so the beta can distinguish normal waiting from a verifier gap.

## Verification run

- Initial `pnpm lint && pnpm build` in the clean worktree failed because the new worktree had no `node_modules`; logged to `.learnings/ERRORS.md` and fixed with `pnpm install --frozen-lockfile`.
- `pnpm install --frozen-lockfile` — pass.
- `pnpm lint` — pass.
- `pnpm build` — pass. Next.js production build compiled, typechecked, and generated all 39 routes successfully.

## Deployment

- Production deployment: `https://cc-i2wvz0bk5-andreas-nordenadlers-projects.vercel.app`
- Canonical alias: `https://sidequestchess.com`
- `vercel --prod --yes` — pass; Vercel build completed and aliased production to `https://sidequestchess.com`.

## Live smoke

Python `urllib.request` smoke checks confirmed:

- Preview `/beta` — HTTP 200 with `After the receipt`, `Make passed, failed, and pending outcomes all useful`, and `Send the username and game link`.
- Canonical `/beta` — HTTP 200 with `After the receipt`, `no dead ends`, and `Pending usually means`.
- Canonical `/account` — HTTP 200 with `Private beta preflight`.
- Canonical `/connect` — HTTP 200 with `Chess.com`.
