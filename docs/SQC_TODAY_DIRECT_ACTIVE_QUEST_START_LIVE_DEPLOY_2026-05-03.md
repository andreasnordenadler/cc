# SQC today direct active-quest start — live deploy proof

Date: 2026-05-03 16:50 Europe/Stockholm
Project: CC / Side Quest Chess

## Change

The `/today` daily quest surface now lets signed-in runners make the daily quest their active quest directly from the page, instead of first detouring through the quest detail route.

Signed-out visitors still get a clean connect-first action, while signed-in runners see:

- `Make today’s quest active` in the hero
- `Set today as active quest` in the readiness checklist
- direct links to exact rules, receipt, and friend quest page

## Files changed

- `src/app/today/page.tsx`
- `.learnings/ERRORS.md` (captured the fresh-worktree install-before-lint gotcha from this burst)

## Verification

Local:

- `pnpm install --frozen-lockfile` ✅
- `pnpm lint` ✅
- `pnpm build` ✅

Production deploy:

- `vercel --prod --yes` ✅
- Deployment: `https://cc-hip003wwf-andreas-nordenadlers-projects.vercel.app`
- Alias: `https://sidequestchess.com` ✅

Live smoke:

- `https://cc-hip003wwf-andreas-nordenadlers-projects.vercel.app/today` returned `200` and contained `Connect to start today`, `Read exact rules`, and `Today readiness` ✅
- `https://sidequestchess.com/today` returned `200` and contained `Connect to start today`, `Read exact rules`, and `Today readiness` ✅
- `https://sidequestchess.com/challenges` returned `200` and contained `Recommended starter route` plus `Accept, play, prove` ✅
- `https://sidequestchess.com/account` returned `200` ✅
- `vercel inspect cc-hip003wwf-andreas-nordenadlers-projects.vercel.app --logs` showed deployment status `Ready` ✅

## User-visible impact

The daily quest loop is now less route-hunty: signed-in beta testers can land on Today, set the shared daily quest as active, play the real game, and return for the latest-game receipt.
