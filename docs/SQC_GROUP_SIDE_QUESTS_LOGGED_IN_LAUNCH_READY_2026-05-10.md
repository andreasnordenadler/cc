# SQC Group Side Quests logged-in launch-ready baseline — 2026-05-10

Andreas confirmed on 2026-05-10 at 16:39 Europe/Stockholm that the `/groupquests` page can be locked as the launch-ready version for the logged-in Group Side Quests overview.

## Baseline

- Route: `https://sidequestchess.com/groupquests`
- Internal route: `/groupquests`
- User-facing name: **Group Side Quests**
- Baseline commit: `bf7024c` (`Make only create step clickable`)
- Production deployment: `https://cc-dyxldolh9-andreas-nordenadlers-projects.vercel.app`, aliased to `https://sidequestchess.com`

## Locked launch-ready decisions

- Use **Group Side Quests** in launch-facing copy, not “rooms”.
- Logged-in overview prioritizes the user’s own/current/previous Group Side Quests.
- Logged-out overview may explain/signpost signup, but this baseline confirmation is specifically for logged-in readiness.
- Hero copy differs by auth state:
  - signed in: starts with “Start a ridiculous chess dare…”
  - signed out: starts with “Sign In/Up and start a ridiculous chess dare…”
- The `Create. Play. Prove.` flow has only step 1 clickable; steps 2 and 3 are static explanatory cards.
- The process graphic uses the noble-knight competition / winner proof-scroll illustration without the extra badge cluster or backing square.
- Hidden/prototype/internal-feeling wording is removed from the launch-facing overview.

## Verification evidence

Latest verification before lock:

- `pnpm lint` passed with 3 pre-existing warnings.
- `pnpm build` passed and listed `/groupquests`, `/groupquests/create`, and `/groupquests/gq_demo_no_castle_01`.
- Production deploy guard passed from a clean clone.
- Production deploy completed and aliased to `https://sidequestchess.com`.
- Live smoke on `/groupquests` returned 200 and confirmed:
  - step 1 create link remains,
  - step 2/3 demo/proof links are absent,
  - launch-facing “room” phrases were removed,
  - Group Side Quests copy is present.

## Change rule

Treat this as the logged-in Group Side Quests overview launch baseline. Future changes to the logged-in `/groupquests` overview should be deliberate launch-candidate deltas, not casual polish churn.
