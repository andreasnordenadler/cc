# SQC Group Side Quests Signed-In Page Trim — 2026-05-10

## Request

Andreas liked the simplified logged-in Group Side Quests dashboard and asked whether anything else could be removed or moved from the page.

## Change

Trimmed the signed-in `/groupquests` experience further:

- removed the separate hero card for signed-in users;
- moved the large `Join with invite link` explainer out of the signed-in flow;
- moved `Create. Play. Prove.` and the proof-ledger explainer to signed-out users only;
- added a small inline invite hint inside the signed-in dashboard instead of a full explanatory section.

## Rationale

Logged-in users are already in the product. Their page should be a control surface, not a landing page. The explainer content still matters for signed-out/first-time users, so it remains there.

## Verification

- `pnpm lint` passed with 3 known warnings.
- `pnpm build` passed and built `/groupquests`, `/groupquests/create`, and `/groupquests/gq_demo_no_castle_01`.

## Deployment

- Production deploy: `https://cc-d4x5f9w1p-andreas-nordenadlers-projects.vercel.app`
- Alias: `https://sidequestchess.com`
- Smoke checks: `/groupquests`, `/groupquests/create`, and `/groupquests/gq_demo_no_castle_01` all returned HTTP 200.
- Authenticated Chrome Apple Events check confirmed the signed-in page still contains `What needs me?` and `Have an invite link?`, while `Create. Play. Prove.` is no longer present for signed-in users.
