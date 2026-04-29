# SQC private beta feedback example live deploy — 2026-04-29

## Summary

Added a filled example report underneath the copy/paste private-beta feedback template on `/beta`, so friends can see the right level of detail to send back after testing one quest receipt.

## Changed

- Updated `/beta` feedback packet with an explicit example report.
- The example demonstrates challenge name, chess source, public username, game link, receipt outcome, fairness note, confusing moment, and screenshot status.
- Kept the existing blank template intact.

## Verification

- `pnpm install --frozen-lockfile` ✅ (prepared clean worktree dependencies)
- `pnpm lint` ✅
- `pnpm build` ✅
- `npx vercel --prod --yes` ✅
  - Production deployment: `https://cc-2hifwwn6x-andreas-nordenadlers-projects.vercel.app`
  - Aliased: `https://sidequestchess.com`
- Live smoke ✅
  - `https://cc-2hifwwn6x-andreas-nordenadlers-projects.vercel.app/beta` returned 200 and contained `Example report`, `sampletester`, `casual game counted`, and `Copy / paste template`.
  - `https://sidequestchess.com/beta` returned 200 and contained the same markers.
  - `https://sidequestchess.com/account` returned 200.
  - `https://sidequestchess.com/connect` returned 200.

## Impact

Private-beta testers no longer have to infer what a useful feedback message should look like. The beta page now shows both the blank template and a realistic filled example, reducing vague or incomplete test reports.
