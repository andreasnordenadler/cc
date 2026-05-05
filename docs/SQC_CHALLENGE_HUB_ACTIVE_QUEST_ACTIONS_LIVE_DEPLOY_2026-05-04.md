# SQC challenge hub active quest actions — live deploy proof

Date: 2026-05-04 13:44–14:02 Europe/Stockholm  
Owner: Sam  
Project: CC / Side Quest Chess

## What changed

Tightened the signed-in `/challenges` active-quest panel so a tester with an active quest can move directly from the hub into the three important next actions:

1. run the latest-game check in `/account`,
2. review the active quest rules,
3. share the current dare link.

This removes a small but real first-run dead end where the active quest panel only offered “Continue quest” even though the product loop is now check/share/receipt oriented.

## Files changed

- `src/app/challenges/page.tsx`

## Verification

- `pnpm install --frozen-lockfile` ✅
- `pnpm lint` ✅
- `pnpm build` ✅
- `vercel --prod --yes` ✅
- Live smoke on preview `/challenges` ✅ — HTTP 200 and challenge-hub assertions passed
- Live smoke on canonical `/challenges` ✅ — HTTP 200 and challenge-hub assertions passed
- Live smoke on canonical `/account` ✅ — HTTP 200
- Live smoke on canonical `/dare/queen-never-heard-of-her` ✅ — HTTP 200
- Bounded Vercel log stream for the deployment emitted no application error lines before timeout; the current CLI does not support `vercel logs <deployment> --since 30m` in this environment.

## Live deployment

- Preview deployment: `https://cc-ro1lpik67-andreas-nordenadlers-projects.vercel.app`
- Canonical alias: `https://sidequestchess.com`
