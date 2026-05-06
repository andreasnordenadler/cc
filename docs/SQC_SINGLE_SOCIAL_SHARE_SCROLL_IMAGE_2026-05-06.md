# SQC single social share scroll image — 2026-05-06

## Scope
Andreas corrected the proof details/share controls: only a single `Share` button is needed, and it should behave like a social media share action with the scroll image plus a link to the home page.

## Changes made

- Simplified `ShareProofActions` to render one share button instead of copy/share/extra utility buttons.
- Added optional image-file sharing: when an OG proof image path is provided, the client fetches it and passes it as a file to the Web Share API when supported.
- Completed proof details now shows only one `Share` button.
- Completed proof sharing uses:
  - the scroll proof image (`/api/og/proof/[token]`) as the shared image when supported;
  - the homepage (`/`) as the shared URL.
- Removed `Proof page`, `Proof image`, `Proof log`, and separate copy buttons from the completed proof details action row.
- Kept fallback behavior: if native image sharing is not supported, the button falls back to copying the share text plus homepage link.

## Verification

- Grep confirmed old completed-proof utility button labels are gone from the proof details implementation.
- `pnpm lint` passed with only existing accepted warnings.
- `pnpm build` passed.
