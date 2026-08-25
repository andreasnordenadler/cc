import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const packet = readFileSync(new URL("../docs/IOS_APP_STORE_RELEASE_PACKET_2026-08-21.md", import.meta.url), "utf8");
const app = JSON.parse(
  readFileSync(new URL("../apps/mobile/app.json", import.meta.url), "utf8"),
).expo;

test("iOS release packet blocks upload when required-reason API declarations are missing or unsupported", () => {
  assert.match(packet, /Missing or unsupported reasons block upload/);
  assert.match(packet, /aggregate privacy report is evidence for reconciliation, not a substitute/i);
});

test("iOS release packet approval-gates immutable distribution and territory compliance choices", () => {
  assert.match(packet, /Distribution method \| Blocked/);
  assert.match(packet, /Public versus Private Distribution cannot be changed after approval/i);
  assert.match(packet, /NPPA game approval number/);
  assert.match(packet, /MIIT ICP Filing Number/);
  assert.match(packet, /Vietnam.*game-publishing license/i);
});

test("iOS review packet does not treat an ordinary demo account as a substitute for SSO review access", () => {
  assert.match(packet, /Do not assume that the ordinary email\/password demo account substitutes for provider-specific SSO review access/);
  assert.doesNotMatch(packet, /ordinary demo account gives full review access while the SSO path itself remains testable/);
});

test("iOS release packet records the recoverable password-reset source receipt without claiming device verification", () => {
  assert.match(packet, /password reset/i);
  assert.match(packet, /signs out other authenticated sessions/i);
  assert.match(packet, /exact-candidate.*not verified/i);
});

test("iOS release packet preserves the Android and web launch-order gate", () => {
  assert.match(packet, /Android and web public launch must be verified before iOS App Review submission or public release/i);
  assert.match(packet, /preparation, source verification, and approved TestFlight work may proceed before that predecessor milestone/i);
});

test("iOS release packet approval-gates the remaining app-record and privacy-policy facts", () => {
  assert.match(packet, /Made for Kids.*No/i);
  assert.match(packet, /1024.?×.?1024.*icon/i);
  assert.match(packet, /User Access selection/i);
  assert.match(packet, /copyright ownership and year/i);
  assert.match(packet, /app-scoped App Manager/i);
  assert.match(packet, /must not download or export.*certificates.*profiles.*API keys.*credentials/i);
});

test("iOS release packet records live production safety and support disclosures without claiming UGC readiness", () => {
  assert.match(packet, /production signed-out readback.*report and block disclosures/i);
  assert.match(packet, /production signed-out Support.*Crowdler AB.*sam@crowdler\.com/i);
  assert.match(packet, /Guideline 1\.2 UGC safety.*Blocked/i);
  assert.doesNotMatch(packet, /production deployment and signed-out readback remain blocked/i);
});

test("iOS release packet binds immutable iOS identity to source and keeps unretained Simulator observations non-release evidence", () => {
  assert.equal(app.ios.bundleIdentifier, "com.sidequestchess.app");
  assert.equal(app.scheme, "sidequestchess");
  assert.equal(app.ios.supportsTablet, true);
  assert.equal(app.ios.usesAppleSignIn, true);
  assert.match(packet, /Xcode 26\.6.*iOS 26\.5 SDK/i);
  assert.match(packet, /Unretained local observation \(not independently auditable evidence\)/i);
  assert.match(packet, /This is not a signed IPA, TestFlight build, physical-device smoke, screenshot asset, or release-readiness receipt/i);
  assert.match(packet, /Signed candidate \| Blocked/i);
  assert.match(packet, /TestFlight \| Not started/i);
  assert.match(packet, /Real iPhone smoke \| Blocked/i);
  assert.doesNotMatch(packet, /signed IPA (?:was|has been) produced/i);
  assert.doesNotMatch(packet, /TestFlight build (?:was|has been) uploaded/i);
  assert.doesNotMatch(packet, /physical-device smoke (?:passed|complete)/i);
});

test("iOS release packet binds current status to the exact reconciled source commit", () => {
  assert.match(packet, /Release-input baseline:\*\* `f752e110cde6e0a38a85ae5d2e484b70feb83b6e` \(`origin\/main`/);
  assert.match(packet, /mobile release inputs are unchanged from `3cf61fb1d5233a8899d5dfcd3a6caea4c2a8dc4a`/i);
  assert.doesNotMatch(packet, /source-preparation changes remain under PR review/i);
});

test("iOS release packet prominently blocks Apple identity, agreements, and App Review access", () => {
  assert.match(packet, /Apple-side App ID ownership\/availability.*unverified/i);
  assert.match(packet, /App Store Connect app record.*unverified/i);
  assert.match(packet, /signing identity.*unverified/i);
  assert.match(packet, /Apple agreements \| Blocked/i);
  assert.match(packet, /App Review information\/access \| Blocked/i);
  assert.match(packet, /non-expiring.*demo account/i);
  assert.match(packet, /international-format phone/i);
});

test("iOS privacy gate requires consent and withdrawal behavior plus processed-upload readback", () => {
  assert.match(packet, /accessible withdrawal mechanism/i);
  assert.match(packet, /processed upload.*version\/build.*export compliance/i);
});
