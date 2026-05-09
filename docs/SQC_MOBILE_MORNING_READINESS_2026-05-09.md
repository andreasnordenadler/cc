# SQC mobile morning readiness — 2026-05-09

## Recommendation

Install/test the latest Android preview build:

- **APK build:** `cd8e7ec0-1ae7-4ae8-9d9d-c70f253423db`
- **Install link:** https://expo.dev/accounts/and72nor/projects/side-quest-chess/builds/cd8e7ec0-1ae7-4ae8-9d9d-c70f253423db
- **Commit:** `7f7ebd1` — `Polish SQC mobile Android test hooks`
- **Visible label:** `Android preview 0.2.9 / polish pass 10`
- **Expo/Android version:** `0.1.9`, `versionCode: 10`

## Overnight APK trail from polish pass 4 onward

| Pass | Commit | Visible label | Expo / Android | APK link / status |
| --- | --- | --- | --- | --- |
| 4 | `e128654` | `Android alpha 0.2.3 / polish pass 4` | `0.1.4` / `versionCode: 5` | Build link not captured in repo docs; screenshot artifact: `tmp/sqc-mobile-polish4-apk.png`. |
| 5 | `86e3dcf` | `Android alpha 0.2.4 / polish pass 5` | `0.1.5` / `versionCode: 6` | Build link not captured in repo docs; screenshot artifact: `tmp/sqc-mobile-polish5-apk.png`. |
| 6 | `4c7a9a4` | `Android preview 0.2.5 / polish pass 6` | `0.1.6` / `versionCode: 7` | Build link not captured in repo docs; screenshot artifact: `tmp/sqc-mobile-polish6-apk.png`. |
| 7 | `1e7efaf` | `Android preview 0.2.6 / polish pass 7` | `0.1.7` / `versionCode: 8` | Build link not captured in repo docs; screenshot artifact: `tmp/sqc-mobile-polish7-apk.png`. |
| 8 | `e89d76b` | `Android preview 0.2.7 / polish pass 8` | `0.1.8` / `versionCode: 9` | Build link not captured in repo docs; screenshot artifact: `tmp/sqc-mobile-polish8-apk.png`. |
| 9 | `023758e` | `Android preview 0.2.8 / polish pass 9` | `0.1.8` / `versionCode: 9` | No fresh EAS build was started in that pass because EAS auth was unavailable in that environment. |
| 10 | `7f7ebd1` | `Android preview 0.2.9 / polish pass 10` | `0.1.9` / `versionCode: 10` | https://expo.dev/accounts/and72nor/projects/side-quest-chess/builds/cd8e7ec0-1ae7-4ae8-9d9d-c70f253423db |

Related earlier Android alpha links preserved in repo docs:

- First alpha: https://expo.dev/accounts/and72nor/projects/side-quest-chess/builds/6b054f4c-9e80-40c8-a03b-674433883d3b
- Crash-fix / startup-fix sequence: https://expo.dev/accounts/and72nor/projects/side-quest-chess/builds/d84b42fa-8893-4fc4-8f7a-8e6717f745aa, https://expo.dev/accounts/and72nor/projects/side-quest-chess/builds/2c311146-efc0-4d25-990e-d86d801125d6, https://expo.dev/accounts/and72nor/projects/side-quest-chess/builds/733b2ee7-c599-4767-b97e-3664a02ed033
- Design-parity alpha: https://expo.dev/accounts/and72nor/projects/side-quest-chess/builds/8214849b-fb48-4f85-bccd-6294535670e0

## Checks and emulator result

Latest build `cd8e7ec0-1ae7-4ae8-9d9d-c70f253423db` was verified on a wiped Android emulator:

- APK installed cleanly.
- Cold launch succeeded.
- App stayed foregrounded.
- No fatal crash was observed.
- Screenshot showed the live quest board loaded, not a blank/loading crash state.

Current app-side source state:

- `apps/mobile/App.tsx` label is `Android preview 0.2.9 / polish pass 10`.
- `apps/mobile/app.json` Android `versionCode` is `10`.
- Public quest browsing, reward previews, status/proof/account clarity cards, guarded website handoffs, and Android test hooks are present.

## Remaining Clerk Native API next steps

1. In the Clerk dashboard for the production Side Quest Chess instance, enable **Native API**.
2. Ensure Google OAuth remains enabled for the same Clerk instance used by `sidequestchess.com`.
3. Add/confirm the Android redirect URL in Clerk:

```text
sidequestchess://sso-callback
```

4. Provide the Expo public publishable key to the mobile build/runtime as `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` through local/EAS env. Do not commit secrets; only the publishable key belongs in client runtime.
5. Rebuild/install the Android APK and tap **Sign in with Google**.
6. Open **Me** and verify `/api/mobile/account` accepts the Expo Clerk bearer token:
   - Pass: account profile, connected chess usernames, progress, active quest, and latest receipt render from the web backend.
   - If still signed out: keep mobile read-only/public and add or adjust the Next.js mobile API bearer-verification helper so `/api/mobile/account` accepts the Clerk Expo session token.
7. Only after the bearer-token path passes, expose account mutation actions on mobile. Website remains the source of truth for quest definitions, verifier logic, proof receipts, and progress state.
