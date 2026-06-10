# SQC Web Support Diagnostics Copy — 2026-06-10

Closed a small website support-readiness parity gap versus mobile-v251: mobile Help & Support had a `Copy support details` action that bundled launch-smoke diagnostics with a support note, while website `/support` only accepted freeform messages.

Website signed-in support now exposes `Copy support details` inside the account-attached support thread. The copied packet includes safe, first-party troubleshooting context only: website surface, whether display/chess usernames are saved, active Solo quest ID, completed count, reward points, stored proof-attempt count, support-thread count, current support page path, browser user agent, and capture timestamp. It does not include private player emails, raw custom quest configs, invite codes, support message bodies beyond the user's explicit form text, or destructive account actions.

Verification:

- `pnpm lint -- src/app/support/page.tsx src/components/support-contact-form.tsx`
- `pnpm build`

Deploy/smoke:

- Commit: `797f2fe`
- Production: `https://cc-iz70b5iyw-andreas-nordenadlers-projects.vercel.app` aliased to `https://sidequestchess.com`
- Live smoke: production and deploy `/support?supportDiagnosticsSmoke=20260610` returned 200 with Support/contact content; signed-out `POST /api/support` returned 401 JSON.
