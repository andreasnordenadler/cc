# Side Quest Chess — exact Google Play listing pack

Prepared: 2026-07-30; candidate and asset inventory refreshed 2026-08-03

Candidate: `0.1.346 (347)` for Internal testing

Package: `com.sidequestchess.app`

Scope: English (United States) main store listing draft and asset acceptance checklist. This file does not authorize a Play Console change or publication.

## Paste-ready listing copy

### App name — 16 / 30 characters

```text
Side Quest Chess
```

### Short description — 79 / 80 characters

```text
Turn chess games into playful Side Quests with proof checks and trophy rewards.
```

### Full description — 1,176 / 4,000 characters

```text
Side Quest Chess adds playful challenges to the chess games you already play.

Choose a Solo Side Quest, play a new public game on your connected Lichess or Chess.com username, then return to check whether the game meets the quest rule. Completed quests unlock collectible Coats of Arms for your Trophy Cabinet.

You can also:
• Create Custom Side Quests with your own rules.
• Join official or community Multiplayer Side Quests.
• Host challenges for friends.
• Track active and completed quests.
• Review proof results from public game records.
• Browse community quests and public leaderboards.
• Manage your account and delete it in the app.
• Contact support from the app.

Side Quest Chess is free. It has no ads, in-app purchases, subscriptions, or real-money prizes. It is intended for players aged 13 and older.

Side Quest Chess reads public game records for the chess usernames you choose to connect. It never asks for your Lichess or Chess.com password. Some features require a Side Quest Chess account and an internet connection.

Side Quest Chess is independent and is not affiliated with, endorsed by, or sponsored by Lichess, Chess.com, FIDE, Google, or Apple.
```

## Store fields from confirmed product facts

| Field | Exact value |
|---|---|
| App or game | Game |
| Free or paid | Free |
| Category | Board |
| Developer / publisher | Crowdler AB |
| Support email | `sam@crowdler.com` |
| Website | `https://sidequestchess.com` |
| Privacy policy | `https://sidequestchess.com/privacy` |
| Countries / regions | Worldwide |
| Target audience | 13+; not directed to children under 13 |
| Ads | No |
| In-app purchases | No |
| Subscriptions | No |
| Real-money gambling or prizes | No |

The final Data safety, App access, Content rating, and Target audience declarations are separate policy forms. Do not infer those answers only from marketing copy.

## Asset acceptance checklist

Google's current Play Console Help requirements were checked on 2026-07-30:

- app name: at most 30 characters;
- short description: at most 80 characters;
- full description: at most 4,000 characters;
- store icon: 512 × 512, 32-bit PNG with alpha, at most 1,024 KB;
- feature graphic: 1,024 × 500, JPEG or 24-bit PNG without alpha;
- at least two screenshots across device types are required;
- for game recommendation surfaces, provide at least three 9:16 portrait screenshots at a minimum of 1,080 × 1,920 (or three qualifying 16:9 landscape screenshots).

Authoritative references:

- `https://support.google.com/googleplay/android-developer/answer/9859152`
- `https://support.google.com/googleplay/android-developer/answer/1078870`

### Current repository inventory

| Asset | Current evidence | Acceptance status |
|---|---|---|
| Play store icon | `apps/mobile/store-assets/google-play/store-icon-512.png`; 512 × 512 RGBA PNG; 434,516 bytes; SHA-256 `dece7654e1346e799a4ee39f4f1bc4dc399bf138ca96e2fea069d56e3d6a25e2` | **Listing-ready export.** It is a deterministic Lanczos downscale of the shipped `apps/mobile/assets/app-icon-light-blue.png` source, converted to 32-bit RGBA without changing the runtime asset. `tests/google-play-store-assets.test.ts` enforces the Play dimensions, format, alpha channel, and size limit. |
| Launcher icon source | `apps/mobile/assets/app-icon-light-blue.png`; 1,024 × 1,024 RGB PNG; SHA-256 `885e46776ebe59366d17eab3bbcc62860af76537288503cf694079f2c9e3d52e` | Shipped source retained unchanged; not the file to upload in the Play listing. |
| Adaptive foreground | `apps/mobile/assets/app-icon-foreground.png`; 1,024 × 1,024 RGBA PNG; SHA-256 `88b8a9585c1899c182b50b1874ff5b43b2ec9a94928cdbd451c54c5c319d1799` | Runtime asset only; not a substitute for the store icon. |
| Feature graphic | `apps/mobile/store-assets/google-play/feature-graphic-1024x500.png`; 1,024 × 500 24-bit RGB PNG; 266,618 bytes; SHA-256 `f89001e2662f29196a53170a8ef2f1f2b8117dc134b71351b54550934e810fe2` | **Listing-ready original composition.** The graphic uses an original brand-blue/chessboard layout, claims only shipped Side Quests, proof checks, and trophies, and incorporates the unchanged shipped launcher artwork as its product mark. It has no alpha channel. `tests/google-play-store-assets.test.ts` enforces complete PNG structure, chunk CRCs, dimensions, bit depth, RGB color type, scanline integrity, and terminal IEND. Independent normal- and thumbnail-scale review found no blocking clipping, readability, composition, or claims issue. |
| Current-candidate store screenshots | No curated listing set exists for code 347 | **Missing.** Earlier responsive engineering captures prove the corrected layout across the required Android matrix, but they are not a listing-ready 9:16 set, are not code-347 captures, and are not Play-delivered-build evidence. |
| Tablet / Chromebook screenshots | No current-candidate listing set found | Optional for initial phone listing; do not claim large-screen listing readiness. |

### Required current-candidate screenshot set

Capture from the Play-delivered code-347 install after tester access and signer verification. Use a non-sensitive disposable account, remove notifications and personal identifiers, and keep the system bars/rendering consistent.

Minimum recommended portrait set (all 1,080 × 1,920 or greater at 9:16):

1. **Choose a Solo Side Quest** — catalog with readable quest names and no loading/error state.
2. **Check proof from public games** — active Solo detail showing the corrected board-and-metadata layout; no private username.
3. **Play challenges together** — official/community Multiplayer catalog or detail with no invite code or personal identity.
4. **Build your Trophy Cabinet** — earned and locked Coats of Arms shown truthfully.
5. **Create your own Side Quest** — executable Custom Side Quest form, not a decorative mockup.

For every final image, verify: exact dimensions/aspect ratio, no clipping or overlap, no keyboard unless intentional, no debug UI, no stale version copy, no private account data, and correspondence with code 347 behavior. Do not use Carl's regression screenshot in the store listing.

## Release alignment and blockers

- Frozen AAB: `side-quest-chess-android-v346-code347.aab`
- AAB SHA-256: `87353e5b90e6769063524fd830a663b449c4088b3c9c60a2310beca0cef6d316`
- Immutable EAS source: `6a0888cb2b76a667168806b7da186dbd3583c451`
- EAS build: `691d9598-fe32-4d8c-949a-ff840384869c` (`production` / `STORE`)
- Committed app identity: `0.1.346` / code `346`; EAS production auto-increment reserved artifact code `347`
- Merged responsive fix: PR #92
- Current `origin/main` changes no file under `apps/mobile` after the immutable candidate source.
- If a later change touches mobile runtime or release inputs, listing screenshots and responsive acceptance must be repeated against the replacement candidate.

Blocking before this listing can be called upload-ready:

1. Current-candidate store screenshots are missing; the preferred set depends on the authorized Play-delivered install.
2. The live privacy/terms source still contains launch-draft status and older contact/controller text (`andreas.nordenadler@gmail.com`) that conflicts with the confirmed publisher and support facts above. Reconcile and legally adopt those pages before public store publication.
3. Play App Signing, tester access, and the code-347 Internal testing install remain unverified owner-gated Console steps.

Google Play upload/submission, listing edits, tester assignment, and publication remain explicit owner gates.
