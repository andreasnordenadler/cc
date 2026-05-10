# SQC Group Side Quests Restore Bottom Flow — 2026-05-10

## Request

Andreas asked to keep **Create. Play. Prove.** at the bottom of the signed-in Group Side Quests page after the signed-in trim pass.

## Change

Restored the lightweight `Create. Play. Prove.` flow section for signed-in users at the bottom of `/groupquests`.

Kept the heavier signed-in removals intact:

- no signed-in hero card;
- no large signed-in invite-link explainer;
- no signed-in proof-ledger explainer.

## Verification

- `pnpm lint` passed with 3 known warnings.
- `pnpm build` passed and built `/groupquests`, `/groupquests/create`, and `/groupquests/gq_demo_no_castle_01`.

## Deployment

- Production deploy: `https://cc-m68h8pznl-andreas-nordenadlers-projects.vercel.app`
- Alias: `https://sidequestchess.com`
- Smoke checks: `/groupquests`, `/groupquests/create`, and `/groupquests/gq_demo_no_castle_01` all returned HTTP 200.
- Authenticated Chrome Apple Events check confirmed the signed-in page contains both `What needs me?` and `Create. Play. Prove.`
