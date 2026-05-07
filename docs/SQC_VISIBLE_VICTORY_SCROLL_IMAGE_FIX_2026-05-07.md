# SQC visible victory scroll image fix — 2026-05-07

## Report
After finishing a quest, Andreas still saw a victory scroll that was not 100% image.

## Root cause
The generated PNG proof image existed and the share action fetched it, but the visible completed-result/proof surfaces still rendered the scroll as HTML via the `VictoryScroll` component.

## Change
- Added `ProofImage`, a client component that renders the generated `/api/og/proof/[token]` PNG directly and appends the browser timezone as `tz`.
- Result page passed state now displays the generated proof PNG instead of the HTML scroll.
- Public `/proof/[token]` page now displays the generated proof PNG instead of the HTML scroll.
- Completed quest detail proof section now displays the generated proof PNG.
- Added image sizing/border styles for the generated proof image.

## Verification
- `pnpm lint` passed with warnings only.
- `pnpm build` passed.
