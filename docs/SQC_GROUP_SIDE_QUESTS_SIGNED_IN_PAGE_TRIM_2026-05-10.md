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

Pending at time of writing.
