# SQC starter path direct activation — live deploy proof

Date: 2026-05-04 07:58 Europe/Stockholm
Owner: Sam

## Change

Made the `/path` starter route less route-hunty for signed-in runners:

- The hero primary action now makes the next starter quest active directly.
- Each unfinished starter-path card can be made active directly from the path page.
- Signed-out visitors get a clear `Connect to start` path instead of a misleading start action.
- Kept preview/browse links so users can still inspect rules before playing.

## Why

The starter path is now the primary first-run route. Letting users activate the next quest directly reduces friction in the core loop: pick quest → play real game → check receipt.

## Verification

- `pnpm install --frozen-lockfile` ✅
- `pnpm lint` ✅
- `pnpm build` ✅
- Commit: `672ce6c` (`Add SQC starter path direct activation`) ✅
- Pushed to `origin/main` ✅
- Production deploy: `https://cc-4uzz6sxrw-andreas-nordenadlers-projects.vercel.app` ✅
- Alias: `https://sidequestchess.com` ✅
- Vercel inspect status: `Ready` ✅
- Live smoke:
  - deploy `/path` returned HTTP 200 and showed signed-out `Connect to start` + `Preview next quest` strings ✅
  - canonical `/path` returned HTTP 200 and showed signed-out `Connect to start` + `Preview next quest` strings ✅
  - canonical `/challenges` returned HTTP 200 and preserved `Recommended starter route` + `Full quest deck` ✅
  - canonical `/result` returned HTTP 200 ✅
- Bounded Vercel log watch emitted no runtime log lines before timeout ✅

## Deployment

Live on `https://sidequestchess.com/path` via deployment `https://cc-4uzz6sxrw-andreas-nordenadlers-projects.vercel.app`.
