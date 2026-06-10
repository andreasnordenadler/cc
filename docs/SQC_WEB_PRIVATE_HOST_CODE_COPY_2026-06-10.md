# SQC Web Private Host Code Copy — 2026-06-10

Closed a small Multiplayer host-management parity gap versus mobile-v251: private Multiplayer hosts on the website could share an invite link containing the host code, but mobile also exposed an explicit `Copy invite code` control for players joining by code.

## Shipped

- Extended the existing Multiplayer share control with an optional host-code clipboard action.
- Host-only private Multiplayer detail/invite views now show `Copy host code` next to `Share quest` / `Copy link`.
- Status copy confirms when the private host code is copied and keeps the existing private invite-link guidance.
- Public/unlisted Multiplayer tables do not render the host-code action.

## Privacy / safety

- The host code is only passed to the client when the signed-in user is already the host and the table uses `private-key` invite mode.
- No participant emails, private account metadata, or raw custom quest configs are exposed.
- No production data was changed.

## Verification

- `pnpm lint -- 'src/app/groupquests/[id]/page.tsx' src/components/group-quest-share-button.tsx`
- `pnpm build`
- Commit: `e4a5caa`
- Production deploy: `https://cc-dxgh459u6-andreas-nordenadlers-projects.vercel.app` → `https://sidequestchess.com`
- Live smoke: 200 for production and deploy seeded Multiplayer detail, plus 200 for production `/groupquests/public?hostCodeCopySmoke=20260610`
