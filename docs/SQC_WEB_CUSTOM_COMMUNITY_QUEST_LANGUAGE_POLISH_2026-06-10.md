# SQC Web Custom/Community Quest Language Polish — 2026-06-10

## Scope
Continued the 24h website UX parity review by tightening player-facing language around Custom Solo and Community Solo. The goal was to keep the established SQC voice while replacing remaining internal-feeling “recipe” labels with product-facing “Side Quest”, “quest”, and “rule” language.

## Changes
- `/account/custom-side-quests`: renamed the hero shelf, success states, empty states, builder guidance, proof-rule label, lifecycle helper copy, library-filter helper copy, and edit action away from “recipe” wording.
- `/challenges/community`: reframed public Community Solo discovery, search, empty states, card CTAs, and fresh-stat fallback around Side Quests rather than recipes.
- `/challenges/community/[id]`: updated detail/share/player-shelf/trust/rule-summary/next-action copy to present the public item as a Community Solo Side Quest with safe public rules.
- `/challenges/community/[id]/not-found`: aligned the missing-public-link message with Side Quest language.
- `/groupquests/create`: updated the Multiplayer quick-start note so published Custom Solo entries are described as Side Quests in the lineup stack.

## Safety / boundaries
- Copy-only visible UX polish; no verifier, lifecycle, publishing, privacy, or release-gate behavior changed.
- Raw custom configs, private drafts, archived quests, private player details, and invite metadata remain hidden.

## Verification
- `grep -RIn "recipe" src/app/account/custom-side-quests/page.tsx src/app/challenges/community src/components/group-quest-draft-builder.tsx` → no matches.
- `pnpm lint -- src/app/account/custom-side-quests/page.tsx src/app/challenges/community/page.tsx 'src/app/challenges/community/[id]/page.tsx' 'src/app/challenges/community/[id]/not-found.tsx' src/components/group-quest-draft-builder.tsx`
- `pnpm build`
