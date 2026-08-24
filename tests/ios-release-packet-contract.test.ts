import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const packet = readFileSync(new URL("../docs/IOS_APP_STORE_RELEASE_PACKET_2026-08-21.md", import.meta.url), "utf8");

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

test("iOS release packet separates login equivalence from account deletion revocation guidance", () => {
  assert.match(packet, /Guideline 4\.8 login equivalence \|/);
  assert.match(packet, /Guideline 5\.1\.1\(v\) account deletion and provider revocation \|/);
  assert.match(packet, /Token revocation is a separate account-deletion requirement under Guideline 5\.1\.1\(v\)/i);
  assert.doesNotMatch(packet, /Guideline 4\.8 login \|[^\n]*revocation/i);
});

test("iOS release packet approval-gates the remaining app-record and privacy-policy facts", () => {
  assert.match(packet, /Made for Kids.*No/i);
  assert.match(packet, /1024.?×.?1024.*icon/i);
  assert.match(packet, /User Access selection/i);
  assert.match(packet, /copyright ownership and year/i);
  assert.match(packet, /app-scoped App Manager/i);
  assert.match(packet, /must not download or export.*certificates.*profiles.*API keys.*credentials/i);
});

test("iOS release packet records production readback without claiming privacy-label completion", () => {
  assert.match(packet, /production readback passed on 2026-08-24/i);
  assert.match(packet, /report and block disclosures/i);
  assert.match(packet, /retained web readback[^\n]+21-production-web-readback\.log/i);
  assert.match(packet, /support body SHA-256 `3195258199e5864da4c5adb36e61302dd3b9fa6815c106eb35c08ebd06c5784a`/i);
  assert.match(packet, /privacy body SHA-256 `954efe75f54dc4b6e35bb24ef41e45e49ead0991995c450ed3464d40a56c8eb4`/i);
  assert.match(packet, /App Privacy answers.*exact-binary.*remain blocked/i);
  assert.doesNotMatch(packet, /production deployment and signed-out readback remain blocked/i);
  assert.doesNotMatch(packet, /App Privacy (?:answers|labels).*(?:complete|adopted|passed)/i);
});

test("iOS release packet records the current local Xcode and CocoaPods receipt without claiming signing", () => {
  assert.match(packet, /Xcode 26\.6.*iOS 26\.5 SDK/i);
  assert.match(packet, /CocoaPods 1\.17\.0/i);
  assert.match(packet, /Release simulator build.*BUILD SUCCEEDED/i);
  assert.match(packet, /No valid local Apple signing identity is verified/i);
  assert.match(packet, /no signed IPA.*TestFlight build/i);
  assert.doesNotMatch(packet, /signed archive:\s*(?:PASS|verified|complete)/i);
  assert.doesNotMatch(packet, /TestFlight (?:build|upload|processing):\s*(?:PASS|verified|complete)/i);
  assert.doesNotMatch(packet, /Full Xcode is unavailable locally/i);
  assert.doesNotMatch(packet, /CocoaPods is unavailable/i);
});

test("iOS release packet is reconciled to the current source and available simulator runtime", () => {
  assert.match(packet, /a2949393bdc18ba6ebda0067842fa71a520ba12f/);
  assert.match(packet, /iOS 26\.5 simulator runtime.*available/i);
  assert.doesNotMatch(packet, /simulator registration remains locally blocked/i);
});

test("iOS listing draft uses plain text and records current field limits", () => {
  assert.match(packet, /Description.*4,000.*plain text/i);
  assert.match(packet, /App Review phone.*international.*\+country-code/i);
  assert.doesNotMatch(packet, /<br>/i);
});

test("iOS release packet records public-proof integrity and deletion-retention blockers", () => {
  assert.match(packet, /unsigned `preview-` proof tokens/i);
  assert.match(packet, /shared proof URLs.*remain readable after account deletion/i);
  assert.match(packet, /proof revocation or expiry/i);
});

test("iOS release packet records the exact current simulator build and bounded launch smoke", () => {
  assert.match(packet, /Release simulator build.*BUILD SUCCEEDED/i);
  assert.match(packet, /a2949393bdc18ba6ebda0067842fa71a520ba12f/);
  assert.match(packet, /ios-20260824-a2949393\/README\.md/i);
  assert.match(packet, /535 warnings/i);
  assert.match(packet, /main\.jsbundle[^\n]+7363ba1711f2e13d6ef3c054deebf53067bde9ca71c3c69d605449589b8e4d5f/i);
  assert.match(packet, /sqc-ios-a2949393-release\.xcresult/i);
  assert.match(packet, /install-launch-linkage\.json/i);
  assert.match(packet, /SideQuestChess-0\.1\.349-1-unsigned-simulator\.zip[^\n]+6ce9200ff137b0b81390fd6d1d0edab21fa0e80678fdb11ceb39a67bd75b0f0a/i);
  assert.match(packet, /Bounded simulator launch smoke:[^\n]+iPhone 17 Pro[^\n]+94D16E18-197E-43FD-A133-572FF0A7FBE4[^\n]+iPad Pro 13-inch \(M5\)[^\n]+02189F8B-B2ED-49AF-83B5-E630C8059EB1[^\n]+OCR[^\n]+Side Quest Chess[^\n]+Browse Solo Side Quests[^\n]+Browse Multiplayer Side Quests/i);
  assert.match(packet, /iPhone SHA-256 `eec98b10954b118378af2995958f1b3ecc0ffb38ed9d4b0097789e491cbb12f2`/i);
  assert.match(packet, /iPad SHA-256 `28a8296192697c8135e37f8ff670ce040657ada85a4b58c1f8a492f67bdf03de`/i);
  assert.match(packet, /local unsigned Simulator support only:[^\n]+not TestFlight evidence and not physical-device evidence/i);
  assert.doesNotMatch(packet, /\.xcresult[^\n]*(?:blocked|not performed)/i);
  assert.match(packet, /`pnpm test`: PASS — 812 tests, 0 failures, 0 skipped\/todo/i);
});
