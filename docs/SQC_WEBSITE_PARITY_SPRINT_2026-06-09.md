# SQC Website Parity Sprint — 2026-06-09

Start: 2026-06-09 17:35 Europe/Stockholm  
Deadline: 2026-06-10 17:35 Europe/Stockholm  
Mode: autonomous, silent, website-only unless shared API/server changes are required for website parity.

## Andreas directive

Remove the prior SQC website feature freeze for this sprint. Bring the website up to functional parity with the mobile app without changing the website's overall look and feel.

## Product constraints

- Preserve the current SQC website visual language, layout style, tone, and navigation feel.
- Do not redesign the site. Add missing functionality in-place using existing components/patterns.
- Treat website and mobile as equal standalone surfaces: a web-first user should not need the app for normal SQC use.
- No external marketing posts/spend.
- No destructive production data changes.
- New live/pickable quests still require real verifier paths and `pnpm quest:release-gate`.

## Functional parity target areas

Audit mobile-v251 behavior and close concrete website gaps, prioritizing:

1. Create/manage custom Solo Side Quests on the website.
2. Chessboard/game proof submission and explicit proof controls on the website.
3. Completed proof receipt details, proof links, copy/share parity.
4. Custom quest lifecycle controls: create, edit/manage where safe, submit proof, reset/deactivate/delete where already supported by backend semantics.
5. Multiplayer create/join/leave/proof/status parity if web is missing app-side flows.
6. Discovery lanes, creator/host context, report/support, Trophy Cabinet, and account readiness parity.
7. Diagnostics/verification docs so the final report distinguishes shipped parity from remaining gaps.

## Execution rules

Each sprint run should:

- Read `ROADMAP.md`, this sprint brief, and relevant app/website/API files.
- Build/update a parity map before coding if the next gap is unclear.
- Pick the highest-impact missing website capability and ship a small safe slice.
- Run meaningful checks: targeted lint/typecheck plus `pnpm build` for substantial changes.
- Deploy production only after checks pass and smoke relevant live routes.
- Commit/push focused changes with proof docs/roadmap updates.
- Stay silent unless a genuine blocker/risk appears.

## Sprint log

- 2026-06-09 17:38–17:47 Europe/Stockholm — Closed the first website-first Custom Solo gap without changing the site language/layout: `/account/custom-side-quests` now includes a signed-in website creator for starter Custom Solo Side Quests, supporting game-result, opening-sequence, move-sequence, and piece-state proof conditions; private draft, private published, and public Community Solo save states; and reversible archive/restore lifecycle controls from the existing library cards. The implementation reuses the shared custom quest metadata model and safe rule summaries, keeps raw configs hidden, avoids destructive delete, and revalidates Community Solo discovery after public lifecycle changes. Verification: `pnpm lint -- src/app/account/custom-side-quests/page.tsx` and `pnpm build` passed.
- 2026-06-09 17:47–17:54 Europe/Stockholm — Production deploy initially exposed a Next 16/Vercel middleware artifact issue and local signed-out smoke exposed that the legacy root `middleware.ts` was shadowing the existing Clerk-aware `src/proxy.ts`. Removed the duplicate root middleware and kept the `src/proxy.ts` Clerk proxy/backslash normalizer as the single request boundary, preserving `/support%5C` canonical redirects. Verification: `pnpm lint -- src/proxy.ts src/app/account/custom-side-quests/page.tsx`; `pnpm build`; local production smoke returned `307` to `/sign-in` for signed-out `/account/custom-side-quests` and `308` from `/support%5C` to `/support`.
- 2026-06-09 17:56 Europe/Stockholm — Production deploy passed after the proxy cleanup. Deploy/alias: `https://cc-ifdqd08tq-andreas-nordenadlers-projects.vercel.app` → `https://sidequestchess.com`. Live smoke: signed-out `/account/custom-side-quests?webCreatorSmoke=20260609` returned `307` to `/sign-in`; `/support%5C?webCreatorSmoke=20260609` returned `308` to `/support`; `/challenges/community?webCreatorSmoke=20260609` returned 200 with Community Solo listings and creator/report/start account affordances.
- 2026-06-09 18:00–18:02 Europe/Stockholm — Continued the Custom Solo website parity slice with explicit proof controls on `/account/custom-side-quests`: published custom recipes now expose website `Start solo run`, active recipes expose `Check latest game` and `Deactivate`, completed recipes expose `Reset proof`, and the library cards show the latest safe proof receipt summary/status without raw config. These actions reuse the existing quest action path so website and mobile update the same active quest/progress/attempt metadata. Verification: `pnpm lint -- src/app/account/custom-side-quests/page.tsx`; `pnpm build`; local production signed-out smoke for `/account/custom-side-quests?proofControlsSmoke=20260609` returned `307` to `/sign-in`. Production deploy/alias passed: `https://cc-4b39mjkit-andreas-nordenadlers-projects.vercel.app` → `https://sidequestchess.com`; live smoke returned `307` to `/sign-in` for signed-out `/account/custom-side-quests?proofControlsSmoke=20260609` and 200 for `/challenges/community?proofControlsSmoke=20260609` with Community Solo listings and start/report/creator affordances.
- 2026-06-09 18:07–18:09 Europe/Stockholm — Started the completed-proof receipt/share parity slice on the website account Trophy Cabinet. Completed official Side Quest cards now keep the existing trophy-card treatment while exposing a canonical `Open proof receipt` link plus the shared social/copy/download proof actions already used by public proof pages. Proof payloads are generated server-side from the latest passed attempt and runner display name, matching the mobile account payload's canonical `proofHref` behavior without exposing raw account metadata. Verification: `pnpm lint -- src/app/account/page.tsx src/components/share-proof-actions.tsx`; `pnpm build`; local production signed-out smoke for `/account?proofReceiptSmoke=20260609` returned `307` to `/sign-in`. Production deploy/alias passed: `https://cc-kjdlo6tl5-andreas-nordenadlers-projects.vercel.app` → `https://sidequestchess.com`; live smoke returned `307` to `/sign-in` for signed-out `/account?proofReceiptSmoke=20260609` and the public preview proof page exposed `Share proof` / `Copy proof link` actions.
- 2026-06-09 18:22–18:35 Europe/Stockholm — Closed a Multiplayer website proof-control gap versus mobile: joined `/groupquests/[id]` pages now show explicit `Check latest game` controls, last proof receipt/status, per-quest verified/open cards, and refreshed Multiplayer score/completion counts using the existing `/api/groupquests/[id]/refresh` verifier path. The slice preserves the existing Multiplayer page/card styling and keeps Solo proof ledgers separate from Multiplayer proof. Verification: `pnpm lint -- 'src/app/groupquests/[id]/page.tsx' src/components/group-quest-proof-controls.tsx`; `pnpm build`; `pnpm deploy:prod` ran release gates/build and deployed `https://cc-dnum340g1-andreas-nordenadlers-projects.vercel.app` → `https://sidequestchess.com`; live signed-out smoke returned 200 for `/groupquests?multiProofSmoke=20260609` and `/groupquests/public?multiProofSmoke=20260609` with Multiplayer/Join content.

- 2026-06-09 19:07–19:15 Europe/Stockholm — Closed the next Custom Solo website lifecycle gap versus mobile saved-rule editing: `/account/custom-side-quests` library cards now reopen the website builder in edit mode, prefill safe starter rule fields, and save updates against the same custom quest ID while preserving badge, proof history, and public URL. Edits can update title, summary, rule, and draft/private/public state for single-condition website starter recipes; multi-condition mobile-created recipes are protected from accidental rule-stack collapse by preserving the existing rule config and only changing metadata/state. Verification: `pnpm lint -- src/app/account/custom-side-quests/page.tsx`; `pnpm build`; production deploy `https://cc-p6xayf5d0-andreas-nordenadlers-projects.vercel.app` → `https://sidequestchess.com`; live smoke returned `307` to `/sign-in` for signed-out `/account/custom-side-quests?customEditSmoke=20260609`, 200 for `/groupquests?customEditSmoke=20260609`, and Community Solo browse still exposed report/start account affordances.
- 2026-06-09 19:37–19:46 Europe/Stockholm — Closed the next official Solo proof-submission website gap versus mobile: active official Side Quest detail pages now expose a specific-game proof form alongside the existing latest-game refresh control. Website-first runners can paste a Lichess game ID or Chess.com game URL and hit the same real verifier server action used for submitted official proof paths, while the page keeps the existing status-card/receipt look and avoids adding submitted-game proof for Custom Solo where the backend still correctly requires latest-game checks. Verification: `pnpm lint -- 'src/app/challenges/[id]/page.tsx'`; `pnpm build`; first `pnpm deploy:prod` release gates passed and production guard correctly blocked deploy before commit because tracked files were modified; committed/pushed `3dc09a5`; production deploy `https://cc-cqxaxoi3g-andreas-nordenadlers-projects.vercel.app` → `https://sidequestchess.com`; live smoke returned 200 for `/challenges/finish-any-game?submittedProofSmoke=20260609` and `/challenges?submittedProofSmoke=20260609` with SQC challenge content.

- 2026-06-09 20:07–20:13 Europe/Stockholm — Closed the private Multiplayer invite-code website parity gap versus mobile: `/groupquests` now has a host-code join lane for signed-in and signed-out users, `/api/groupquests/invite/lookup` resolves valid private invite codes without listing private tables publicly, `/groupquests/[id]` carries the invite code into the existing accept modal, and `/api/groupquests/[id]/join` now enforces matching codes for `private-key` Multiplayer Side Quests while preserving public/unlisted join behavior. Verification: `pnpm lint -- src/app/groupquests/page.tsx 'src/app/groupquests/[id]/page.tsx' src/components/group-quest-accept-modal.tsx src/components/group-quest-invite-key-join.tsx 'src/app/api/groupquests/[id]/join/route.ts' src/app/api/groupquests/invite/lookup/route.ts`; `pnpm build`; committed/pushed `ce75303`; `pnpm deploy:prod` ran release gates/build and deployed `https://cc-1pmk9ftzx-andreas-nordenadlers-projects.vercel.app` → `https://sidequestchess.com`; live smoke returned 200 for `/groupquests?privateInviteSmoke=20260609` with the private invite form and 401 `sign_in_required` for signed-out `/api/groupquests/invite/lookup`.

- 2026-06-09 20:38–20:46 Europe/Stockholm — Closed the next Community Multiplayer discovery/context gap versus mobile: `/groupquests/public` now supports public table search, open/all/finished status filtering, host-shelf filtering, host labels, and direct `More by host` links while keeping private invite-only tables hidden. Community Multiplayer detail/invite pages now expose host context, more-public-tables-by-host, and report/support actions for non-official tables without exposing participant emails or private account metadata. Verification: `pnpm lint -- src/app/groupquests/public/page.tsx 'src/app/groupquests/[id]/page.tsx'`; `pnpm build`; committed/pushed `cbcd26a`; production deploy `https://cc-4t555wdxj-andreas-nordenadlers-projects.vercel.app` → `https://sidequestchess.com`; live smoke returned 200 for `/groupquests/public?multiDiscoverySmoke=20260609` with `Discovery filters`, host labels, and `More by host`, and 200 for `/groupquests/seed-public-sqcseed11-11?multiDiscoverySmoke=20260609` with `Host context`, `More by host`, and `Report Side Quest`.

## Final report requirements

At deadline, report: shipped website features, commits/deploys, verification evidence, remaining gaps, and recommended next sprint priorities.
