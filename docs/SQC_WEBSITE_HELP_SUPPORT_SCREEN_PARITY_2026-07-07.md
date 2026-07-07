# SQC website Help & Support screen parity - 2026-07-07

Source of truth: `apps/mobile/App.tsx`, especially `GlobalHamburgerMenu`, `AccountTrackerDashboard`, and `HelpSupportModal`.

Known unrelated untracked file remains untouched: `docs/research/SQC_MONETIZATION_RESEARCH_RECOMMENDATIONS_2026-07-01.md`.

## Change

- `/support` now uses the same compact app-screen treatment as the rebuilt Account surface instead of the older broad help layout.
- The first-screen actions match the mobile help/account context: browse Solo Side Quests, connect a chess username, and read proof rules.
- The Help topics are grouped under an app-style `App help topics` panel and keep the mobile modal topics: active Solo, Solo choice, proof failure, Coat of Arms, Multiplayer detail, Multiplayer overview, and connected chess accounts.
- `/help-support` is now an explicit Help & Support route alias with its own metadata while preserving the same support form and signed-in account diagnostics as `/support`.

## Verification

- `pnpm build` passed on 2026-07-07. Next.js still reports the existing workspace-root warning because multiple lockfiles are present.
- Local production smoke with `pnpm start`:
  - `/support` at 390x844 rendered `Help & Support.`, `APP HELP TOPICS`, `CONNECTING CHESS ACCOUNTS`, and `Privacy Policy`.
  - `/help-support` at 1280x900 rendered the same support screen through the alias route.
- Screenshots:
  - `artifacts/sqc-website-help-support-parity-2026-07-07/support-mobile-web.png`
  - `artifacts/sqc-website-help-support-parity-2026-07-07/help-support-desktop.png`

## Notes

- The first smoke assertion expected mixed-case `App help topics`; rendered text is uppercase because the site eyebrow style transforms it. The corrected smoke checks the actual rendered text.
- No support API, account diagnostics, Clerk auth, proof, or contact-form behavior was changed.
