# SQC web support help topics — 2026-06-10

Closed a small website Help & Support parity gap versus mobile-v251: the mobile Help & Support modal had five concrete self-help topics and let signed-out or signed-in users copy safe support diagnostics, while the website support page only had a shorter generic topic grid and exposed `Copy support details` inside the signed-in thread card.

## Shipped

- Replaced the website `/support` topic grid with the same practical help areas as mobile:
  - How Side Quests work
  - Why proof may not verify
  - Connecting chess accounts
  - Multiplayer Side Quests
  - Coat of Arms
- Made `Copy support details` available to signed-out and signed-in website visitors.
- Kept signed-in account support threads account-attached and separate from the generic support details card.
- The copied packet remains privacy-safe: page path, browser, timestamp, and signed-in readiness flags only; no private emails, raw custom quest configs, chess-site passwords, invite codes, or destructive actions.

## Verification

- `pnpm lint -- src/app/support/page.tsx src/components/support-contact-form.tsx`
- `pnpm build`
