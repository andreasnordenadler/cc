import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

const packetPath = path.resolve("docs/IOS_APP_STORE_RELEASE_PACKET_2026-08-16.md");
const appConfigPath = path.resolve("apps/mobile/app.json");
const mobilePackagePath = path.resolve("apps/mobile/package.json");

test("iOS preparation packet stays aligned with the source identity and fail-closed gates", async () => {
  const [packet, configSource, packageSource, appSource] = await Promise.all([
    readFile(packetPath, "utf8"),
    readFile(appConfigPath, "utf8"),
    readFile(mobilePackagePath, "utf8"),
    readFile(path.resolve("apps/mobile/App.tsx"), "utf8"),
  ]);
  const config = JSON.parse(configSource).expo;
  const mobilePackage = JSON.parse(packageSource);

  assert.equal(config.name, "Side Quest Chess");
  assert.equal(config.scheme, "sidequestchess");
  assert.equal(config.ios.bundleIdentifier, "com.sidequestchess.app");
  assert.equal(config.ios.supportsTablet, true);
  assert.equal(config.ios.buildNumber, undefined);
  assert.equal(config.ios.usesAppleSignIn, true);
  assert.equal(config.ios.associatedDomains, undefined);
  assert.equal(config.ios.privacyManifests, undefined);
  assert.equal(config.owner, "and72nor");
  assert.equal(config.android.versionCode, 349);
  assert.equal(mobilePackage.dependencies?.["expo-apple-authentication"], "~8.0.8");
  assert.match(appSource, /`Application ID: \$\{applicationId\}`/);
  assert.match(appSource, /Application ID \{candidateIdentity\.applicationId\}\.<\/Text>/);
  assert.match(appSource, /if \(!__DEV__ \|\| isAuthenticatedAccount\(account\)\) return account;/);
  assert.doesNotMatch(appSource, /EXPO_PUBLIC_SQC_MOBILE_PREVIEW_AUTH/);
  assert.doesNotMatch(appSource, /andreas\.nordenadler@gmail\.com/);
  const previewFixture = appSource.slice(appSource.indexOf("function getDevTrackerPreviewAccount"));
  assert.doesNotMatch(previewFixture, /\b(?:Andreas|SAM|and72nor)\b/);
  await assert.rejects(access(path.resolve("apps/mobile/PrivacyInfo.xcprivacy")));
  await assert.rejects(access(path.resolve("apps/mobile/ios")));

  assert.match(packet, /Upstream baseline:\*\* `a5ac084fa22c11a5f5f27903fe71af3fe7ce2c50`/);
  assert.match(packet, /Reconciled through:\*\* `a5ac084fa22c11a5f5f27903fe71af3fe7ce2c50`/);
  assert.ok(packet.includes(`Current source declares Expo version \`${config.version}\` and Android version code \`${config.android.versionCode}\``));
  assert.match(packet, /makes no Android approval or public-launch claim/);
  assert.match(packet, /no verified signed iOS archive, TestFlight build\/install/);
  assert.ok(packet.includes(`| Bundle ID | \`${config.ios.bundleIdentifier}\` |`));
  assert.match(packet, /`sidequestchess:\/\/sso-callback`/);
  assert.match(packet, /Do not use Andreas's personal Apple identity/);
  assert.match(packet, /\| iOS build number \| Not source-controlled \|/);
  assert.match(packet, /\| Apple login \| Native Clerk flow, Expo plugin and iOS capability declaration prepared \|/);
  assert.match(packet, /\| Privacy manifest \| No app-owned manifest\/config entry \|/);
  assert.match(packet, /matching server routes must be deployed before distributing this client/i);
  assert.match(packet, /source still names owner `and72nor` and project `9af73cb2-dcd5-4429-b194-67fc81206937`/i);
  assert.match(packet, /local preview-account fixture unconditionally development-only/i);
  assert.match(packet, /signed-out support fallback with `sam@crowdler\.com`/i);
  assert.match(packet, /Contests are present under Apple's current definition/);
  assert.match(packet, /Exact frequency remains unresolved/);
  for (const descriptor of [
    "Mature or Suggestive Themes",
    "Health or Wellness Topics",
    "Cartoon or Fantasy Violence",
    "Realistic Violence",
    "Prolonged Graphic or Sadistic Realistic Violence",
    "Guns or Other Weapons",
  ]) {
    assert.ok(packet.includes(descriptor), `missing age-rating descriptor: ${descriptor}`);
  }
  assert.match(packet, /Gambling \(presence\): No/);
  assert.match(packet, /Loot Boxes \(presence\): No/);
  assert.match(packet, /Simulated Gambling \(frequency\): None/);
  assert.match(packet, /Messaging and Chat: Yes/);
  assert.match(packet, /Identifiers \/ User ID \| App Functionality; Analytics/);
  assert.match(packet, /Usage Data \/ Product Interaction \| App Functionality; Analytics/);
  assert.match(packet, /not a complete nutrition label/);
  assert.match(packet, /Device ID or Other Data Types cannot be ruled out yet/);
  assert.match(packet, /connected public chess usernames, active solo quest title and multiplayer totals/);
  assert.match(packet, /classified in their underlying Identifier, Gameplay Content and Product Interaction rows rather than relabeling them as diagnostics/);
  assert.match(packet, /type `DELETE MY ACCOUNT` → Permanently delete account/);
  assert.match(packet, /primary and secondary review accounts that do not expire during review or re-review/);
  assert.match(packet, /report reaches the staffed queue, escalation\/response SLA, removal/);
  assert.match(packet, /storefront override alone is not access control/);
  assert.match(packet, /Australia 16\+, Vietnam 16\+ and Republic of Korea 15\+/);
  assert.match(packet, /report\/block records/);
  assert.match(packet, /4,000-byte limit/);
  assert.match(packet, /monitor authentication, APIs, chess-provider fixtures, moderation and deletion throughout review and re-review/);
  assert.match(packet, /minimum supported iOS\/iPadOS version and the then-current public OS/);
  assert.match(packet, /`1260×2736`, `1290×2796` or `1320×2868`/);
  assert.match(packet, /`1284×2778` or `1242×2688`/);
  assert.match(packet, /`2064×2752` or `2048×2732`/);
  assert.match(packet, /clean temporary `expo prebuild --platform ios --no-install`/);
  assert.match(packet, /build `1`, URL schemes `sidequestchess` plus `com\.sidequestchess\.app`/);
  assert.match(packet, /`com\.apple\.developer\.applesignin = Default`/);
  assert.match(packet, /No app-target `PrivacyInfo\.xcprivacy` was generated before pod installation/);
  assert.match(packet, /narrowest role justified by a task-by-task permissions matrix/);
  assert.match(packet, /TestFlight upload, TestFlight device acceptance, App Review submission, App Review acceptance, release approval and public storefront availability are distinct states/);
});

test("public support fallback uses the Crowdler controller address", async () => {
  const [supportSource, privacySource, termsSource] = await Promise.all([
    readFile(path.resolve("src/components/support-contact-form.tsx"), "utf8"),
    readFile(path.resolve("src/app/privacy/page.tsx"), "utf8"),
    readFile(path.resolve("src/app/terms/page.tsx"), "utf8"),
  ]);
  assert.match(supportSource, /const SUPPORT_EMAIL = "sam@crowdler\.com";/);
  assert.doesNotMatch(supportSource, /andreas\.nordenadler@gmail\.com/);
  assert.match(privacySource, /sam@crowdler\.com/);
  assert.match(termsSource, /sam@crowdler\.com/);
});

test("App Store discovery fields fit Apple's source-level limits and never abbreviate the public name", async () => {
  const packet = await readFile(packetPath, "utf8");
  const listing = packet.slice(packet.indexOf("## 4. App Store listing draft"), packet.indexOf("## 5. Age-rating"));
  const subtitle = listing.match(/\| Subtitle \| ([^|]+) \|/)?.[1];
  const keywords = listing.match(/`([^`]+)`\n\n\*\*Description:/)?.[1];
  const promotionalText = listing.match(/\*\*Promotional text:\*\* (.+)/)?.[1];
  const description = listing.match(/\*\*Description:\*\*\n\n([\s\S]+?)\n\nBefore submission/)?.[1];

  assert.ok(subtitle);
  assert.ok(keywords);
  assert.ok(promotionalText);
  assert.ok(description);
  assert.equal("Side Quest Chess".length <= 30, true);
  assert.ok(subtitle.length <= 30, "subtitle exceeds 30 characters");
  assert.ok(Buffer.byteLength(keywords, "utf8") <= 100, "keywords exceed 100 UTF-8 bytes");
  assert.doesNotMatch(keywords, /(?:lichess|chesscom|chess\.com)/i, "keywords must not name other apps or companies");
  assert.ok(promotionalText.length <= 170, "promotional text exceeds 170 characters");
  assert.ok(description.length <= 4000, "description exceeds 4,000 characters");
  assert.doesNotMatch(listing, /\bSQC\b/);
  assert.match(listing, /\| Name \| Side Quest Chess \|/);
  assert.match(listing, /\| Primary category \| Games \|/);
  assert.match(listing, /\| Games subcategories \| Board; Strategy \|/);
  assert.match(listing, /\| Secondary category \| None proposed;/);
  assert.doesNotMatch(listing, /\| (?:Primary|Secondary) category \| Games —/);
  assert.match(listing, /\| Price \| Free \|/);
  const config = JSON.parse(await readFile(appConfigPath, "utf8")).expo;
  assert.ok(listing.includes(`| Version | Candidate \`${config.version}\`;`));
  assert.match(listing, /\| Availability \| Worldwide target, excluding any territory/);
  assert.match(listing, /mainland China ISBN\/approval\/ICP applicability, Vietnam game licensing\/classification/);
  assert.match(listing, /South Korea game rating\/RCN applicability/);
  assert.match(listing, /\| Content rights \| Yes/);
  assert.match(listing, /\| EU trader status \|/);
  assert.match(listing, /\| Tax category \|/);
  assert.match(listing, /\| License agreement \|/);
  assert.doesNotMatch(keywords, /puzzles/i);
  assert.match(listing, /\| What's New \| Not required only if discovery confirms this is version 1/);
  assert.match(listing, /\| Release method \| Manual release/);
});

test("all mobile safety routes retain legacy Android provenance compatibility", async () => {
  const routes = await Promise.all([
    readFile(path.resolve("src/app/api/blocks/users/route.ts"), "utf8"),
    readFile(path.resolve("src/app/api/reports/content/route.ts"), "utf8"),
    readFile(path.resolve("src/app/api/reports/creators/route.ts"), "utf8"),
  ]);

  for (const source of routes) {
    assert.match(source, /\["android", "mobile"\]\.includes\(request\.headers\.get\("x-side-quest-chess-client"\)/);
  }
});
