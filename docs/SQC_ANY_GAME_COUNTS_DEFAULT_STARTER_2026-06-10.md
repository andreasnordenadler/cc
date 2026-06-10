# SQC Any Game Counts default starter

Date: 2026-06-10

## Change

New signed-in SQC users now get `finish-any-game` / **Any Game Counts** pre-selected as their active starter Solo Side Quest.

## Coverage

The default is applied through shared metadata helpers and wired into first-load account surfaces:

- `/` signed-in home
- `/account`
- `/challenges`
- `/challenges/[id]`
- `/api/mobile/account`

This makes the web and mobile account bootstrap paths agree on the same starter active quest.

## Safety rules

The starter default is only applied when the public metadata indicates a truly fresh quest state:

- no existing `activeChallenge`
- no completed Side Quests
- no saved challenge attempts

Existing users with an active quest, completed quest history, or proof attempts are not overwritten.

## Verification

- `pnpm lint -- src/lib/user-metadata.ts src/app/page.tsx src/app/account/page.tsx src/app/challenges/page.tsx 'src/app/challenges/[id]/page.tsx' src/app/api/mobile/account/route.ts`
- `pnpm build`
- `pnpm quest:release-gate`

All checks passed locally before commit/deploy.

## Ship proof

- Commit: `5341509` (`Default new users to Any Game Counts`)
- Production deploy: `https://cc-mku0r6fse-andreas-nordenadlers-projects.vercel.app`
- Alias: `https://sidequestchess.com`
- Live smoke: 200 for `/`, `/challenges`, `/challenges/finish-any-game`, and the deploy URL `/challenges/finish-any-game`, with expected `Any Game Counts` / SQC content.
