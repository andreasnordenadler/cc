# SQC dare direct accept live deploy — 2026-05-03

## Change

Made `/dare/[id]` friend-quest pages auth-aware so an invite recipient can accept and save the exact dared quest directly from the dare page instead of detouring through `/account` or the full quest page first.

## User-visible impact

- Signed-in runners now see direct server-action buttons on friend quest pages:
  - `Accept and save this quest`
  - `Make this my active quest`
- Signed-out runners get a clearer connect-first path:
  - `Connect to accept quest`
  - `Connect to save quest`
- The proof-path copy now says the exact dare can be saved from the friend page, tightening the viral loop: dare received → accept → play → prove.
- The site nav on dare pages now reflects signed-in state instead of always rendering as signed out.

## Verification

Local:

- `pnpm install --frozen-lockfile` ✅
- `pnpm lint` ✅
- `pnpm build` ✅

Deploy:

- Production deploy: `https://cc-j9sy04wpe-andreas-nordenadlers-projects.vercel.app` ✅
- Aliased to: `https://sidequestchess.com` ✅
- Vercel inspect status: `Ready` ✅

Live smoke:

- Deploy `/dare/knights-before-coffee`: HTTP 200, contains `Connect to accept quest`, `Read full rules`, and `Save this exact dare as your active quest right from the friend page.` ✅
- Canonical `/dare/knights-before-coffee`: HTTP 200 with same content assertions ✅
- Canonical `/challenges/knights-before-coffee`: HTTP 200, contains `Connect to start` and `Friend quest page` ✅
- Canonical `/result`: HTTP 200, contains result friend-quest handoff copy ✅
- Bounded Vercel log watch: no output emitted during the watch window ✅

## Notes

One smoke assertion was corrected during verification: signed-out challenge pages should show `Connect to start`, not signed-in-only `Start this bad idea`.
