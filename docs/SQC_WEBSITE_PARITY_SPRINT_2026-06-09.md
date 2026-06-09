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

## Final report requirements

At deadline, report: shipped website features, commits/deploys, verification evidence, remaining gaps, and recommended next sprint priorities.
