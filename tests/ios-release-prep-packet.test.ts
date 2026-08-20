import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

const packetPath = path.resolve("docs/IOS_APP_STORE_RELEASE_PACKET_2026-08-16.md");
const appConfigPath = path.resolve("apps/mobile/app.json");
const mobilePackagePath = path.resolve("apps/mobile/package.json");

test("iOS preparation packet stays aligned with the source identity and fail-closed gates", async () => {
  const [packet, configSource, packageSource] = await Promise.all([
    readFile(packetPath, "utf8"),
    readFile(appConfigPath, "utf8"),
    readFile(mobilePackagePath, "utf8"),
  ]);
  const config = JSON.parse(configSource).expo;
  const mobilePackage = JSON.parse(packageSource);

  assert.equal(config.name, "Side Quest Chess");
  assert.equal(config.scheme, "sidequestchess");
  assert.equal(config.ios.bundleIdentifier, "com.sidequestchess.app");
  assert.equal(config.ios.supportsTablet, true);
  assert.equal(config.ios.buildNumber, undefined);
  assert.equal(config.ios.usesAppleSignIn, undefined);
  assert.equal(config.ios.associatedDomains, undefined);
  assert.equal(config.ios.privacyManifests, undefined);
  assert.equal(mobilePackage.dependencies?.["expo-apple-authentication"], undefined);
  await assert.rejects(access(path.resolve("apps/mobile/PrivacyInfo.xcprivacy")));

  assert.match(packet, /Reconciled through:\*\* `5cc23d7c2097dbb90489373630e07080d25af2cb`/);
  assert.match(packet, /Android `0\.1\.349` \/ version code `350`.*Google Play \*\*Internal testing\*\*/);
  assert.match(packet, /Android production\/public rollout is not verified/);
  assert.match(packet, /no verified signed archive, TestFlight build or installation/);
  assert.ok(packet.includes(`| Bundle ID | \`${config.ios.bundleIdentifier}\` |`));
  assert.match(packet, /`sidequestchess:\/\/sso-callback`/);
  assert.match(packet, /Do not use Andreas's personal identity/);
  assert.match(packet, /no source-controlled `ios\.buildNumber`/);
  assert.match(packet, /Sign in with Apple is absent/);
  assert.match(packet, /No app-owned `PrivacyInfo\.xcprivacy`/);
  assert.match(packet, /matching server routes must be deployed before distributing a candidate/);
  assert.match(packet, /TestFlight upload, review submission, and public availability are separately approved states/);
});

test("App Store discovery fields fit Apple's source-level limits and never abbreviate the public name", async () => {
  const packet = await readFile(packetPath, "utf8");
  const listing = packet.slice(packet.indexOf("## 3. App Store listing draft"), packet.indexOf("## 4. Age rating"));
  const subtitle = listing.match(/\*\*Subtitle:\*\* (.+)/)?.[1];
  const keywords = listing.match(/`([^`]+)`\n\n\*\*Primary category:/)?.[1];
  const promotionalText = listing.match(/\*\*Promotional text \(optional\):\*\* (.+)/)?.[1];

  assert.ok(subtitle);
  assert.ok(keywords);
  assert.ok(promotionalText);
  assert.ok(subtitle.length <= 30, "subtitle exceeds 30 characters");
  assert.ok(Buffer.byteLength(keywords, "utf8") <= 100, "keywords exceed 100 UTF-8 bytes");
  assert.ok(promotionalText.length <= 170, "promotional text exceeds 170 characters");
  assert.doesNotMatch(listing, /\bSQC\b/);
  assert.match(listing, /\*\*Name:\*\* Side Quest Chess/);
});