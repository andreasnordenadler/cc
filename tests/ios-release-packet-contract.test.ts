import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const packet = readFileSync(new URL("../docs/IOS_APP_STORE_RELEASE_PACKET_2026-08-21.md", import.meta.url), "utf8");
const header = packet.slice(0, packet.indexOf("## 1. Verified baseline and blockers"));
const verifiedBaseline = packet.slice(
  packet.indexOf("## 1. Verified baseline and blockers"),
  packet.indexOf("## 2. Fail-closed gate ledger"),
);
const gateLedger = packet.slice(
  packet.indexOf("## 2. Fail-closed gate ledger"),
  packet.indexOf("## 3. Safe source work still required"),
);
const privacyDraft = packet.slice(
  packet.indexOf("## 5. App Privacy nutrition-label draft"),
  packet.indexOf("## 6. Age-rating draft"),
);
const verificationReceipt = packet.slice(
  packet.indexOf("## 12. Verification receipt for this branch"),
  packet.indexOf("## 13. Authoritative Apple references"),
);

test("iOS release packet is bound to the current reconciled main candidate", () => {
  assert.match(header, /Source baseline.*a161663a041f91306f4970b735525c403f3d48d1/);
  assert.match(header, /source-preparation changes.*merged/i);
  assert.doesNotMatch(header, /70545c4e50addce85ae2fdade56345b7293e3b2c/);
  assert.doesNotMatch(header, /source-preparation changes remain under PR review/i);
});

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

test("iOS release packet records production readback of support and safety disclosures", () => {
  assert.match(gateLedger, /Privacy policy safety data \| Production readback verified/);
  assert.match(gateLedger, /Support URL contact \| Email\/address verified/);
  assert.match(gateLedger, /sam@crowdler\.com/);
  assert.match(privacyDraft, /Production signed-out readback verified/i);
  assert.doesNotMatch(packet, /production deployment and signed-out readback remain blocked/i);
  assert.doesNotMatch(packet, /Source fix pending deployment/i);
  assert.doesNotMatch(packet, /current privacy policy.*does not explicitly disclose content and creator reports/i);
});

test("iOS release packet records the current local Xcode and Simulator build receipt without claiming signed evidence", () => {
  assert.match(verifiedBaseline, /Xcode 26\.6.*iOS 26\.5 SDK/i);
  assert.match(verifiedBaseline, /CocoaPods 1\.17\.0/i);
  assert.match(verifiedBaseline, /iOS 26\.5 Simulator runtime.*registered/i);
  assert.match(verifiedBaseline, /Release.*Simulator build.*succeeded/i);
  assert.match(verifiedBaseline, /iPhone 17 Pro Max.*launch.*succeeded/i);
  assert.match(verifiedBaseline, /handoff.*sidequestchess:\/\/sso-callback.*succeeded/i);
  assert.match(verificationReceipt, /No signed archive, IPA/);
  assert.doesNotMatch(packet, /Full Xcode is unavailable locally/i);
  assert.doesNotMatch(packet, /CocoaPods is unavailable/i);
  assert.doesNotMatch(packet, /Simulator registration remains locally blocked/i);
});
