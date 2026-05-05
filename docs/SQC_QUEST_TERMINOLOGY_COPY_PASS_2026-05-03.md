# SQC quest terminology copy pass — 2026-05-03

## Request
Andreas asked to enforce **quest** across SQC copy instead of visible **dare** or **challenge** wording.

## Scope
Updated user-facing copy across the SQC app surfaces, metadata/share copy, verifier/result messages, navigation labels, OG text, and support/account/beta wording.

Kept internal route and code identifiers such as `/challenges`, `/dare/[id]`, `ChallengeBadge`, and `challengeId` unchanged to avoid breaking existing URLs, data keys, and app behavior.

## Verification
- `pnpm lint` — pending in final proof
- `pnpm build` — pending in final proof
- Production deploy + live smoke — pending in final proof

## Notes
This is a terminology-only pass: no quest logic, verifier logic, auth flow, or data model behavior is intentionally changed.
