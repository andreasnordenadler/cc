# SQC private beta feedback packet — live deploy proof

Date: 2026-04-29

## Change

Added a dedicated `/beta` feedback packet section for friends/private beta testers.

The section tells testers to send back:

- challenge name/path used
- chess source/provider + username + game link when relevant
- receipt outcome: passed, failed, or pending
- screenshot/context when the loop is confusing

## Scope

- `src/app/beta/page.tsx`
- `ROADMAP.md`

No verifier logic, auth behavior, account metadata, challenge rules, or receipt persistence changed.

## Verification

Local verification:

- `pnpm lint` ✅
- `pnpm build` ✅

Production deployment:

- Preview/prod deployment: `https://cc-17o3n4vj9-andreas-nordenadlers-projects.vercel.app`
- Canonical alias: `https://sidequestchess.com`

Live smoke:

- `https://cc-17o3n4vj9-andreas-nordenadlers-projects.vercel.app/beta` returned 200 and contained `Feedback packet`, `challenge · source · receipt`, `Receipt outcome`, and `Chess source` ✅
- `https://sidequestchess.com/beta` returned 200 and contained the same feedback-packet strings ✅
- `https://sidequestchess.com/account` returned 200 and retained the private-beta preflight strings ✅
- `https://sidequestchess.com/connect` returned 200 and retained Lichess/Chess.com identity copy ✅
