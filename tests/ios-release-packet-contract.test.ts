import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const packet = readFileSync(new URL("../docs/IOS_APP_STORE_RELEASE_PACKET_2026-08-21.md", import.meta.url), "utf8");
const receipt = readFileSync(new URL("../docs/IOS_CURRENT_CANDIDATE_RECEIPT_2026-08-23.md", import.meta.url), "utf8");

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
  assert.match(receipt, /Android and web public launch.*precede iOS App Review submission and public release/i);
});

test("iOS release packet approval-gates account-backed read-only Apple discovery", () => {
  const approvalBoundaries = packet.match(/## 11\. Explicit approval boundaries[\s\S]*?## 12\./)?.[0] ?? "";

  assert.match(approvalBoundaries, /logging in to Apple Developer or App Store Connect for read-only discovery/i);
  assert.match(approvalBoundaries, /approved dedicated operator.*Crowdler AB team.*scope/i);
});

test("iOS release packet approval-gates the remaining app-record and privacy-policy facts", () => {
  assert.match(packet, /Made for Kids.*No/i);
  assert.match(packet, /1024.?×.?1024.*icon/i);
  assert.match(packet, /User Access selection/i);
  assert.match(packet, /copyright ownership and year/i);
  assert.match(packet, /app-scoped App Manager/i);
  assert.match(packet, /must not download or export.*certificates.*profiles.*API keys.*credentials/i);
});

test("iOS release packet distinguishes source-prepared safety disclosures from production evidence", () => {
  assert.match(packet, /report and block disclosures are source-prepared/i);
  assert.match(packet, /production deployment and signed-out readback remain blocked/i);
  assert.doesNotMatch(packet, /current privacy policy.*does not explicitly disclose content and creator reports/i);
});

test("iOS release packet points current local build claims at the exact-candidate receipt", () => {
  const sourceBaseline = packet.match(/^\*\*Source baseline:\*\*.*$/m)?.[0] ?? "";
  const currentReceipt = packet.match(/^- Current exact-candidate receipt:.*$/m)?.[0] ?? "";
  const screenshotGate = packet.match(/^\| Screenshots .*$/m)?.[0] ?? "";

  assert.match(sourceBaseline, /35edd62f159baf42f53ae023d98c78a318c768d1/);
  assert.match(currentReceipt, /IOS_CURRENT_CANDIDATE_RECEIPT_2026-08-23\.md/);
  assert.match(currentReceipt, /Release Simulator build, install, and launch passed/i);
  assert.match(currentReceipt, /iPhone 17e.*iPad Pro 13-inch/i);
  assert.match(currentReceipt, /scheme routing only/i);
  assert.match(currentReceipt, /not.*provider authentication.*signed archive.*IPA.*TestFlight.*physical-device/i);
  assert.match(receipt, /Commit: `35edd62f159baf42f53ae023d98c78a318c768d1`/);
  assert.match(receipt, /Repository tests \| Passed: 803 tests, 0 failed, 0 skipped, 0 todo/);
  assert.match(receipt, /Result: `\*\* BUILD SUCCEEDED \*\*`/);
  assert.match(receipt, /iPhone 17e[\s\S]*iOS 26\.5[\s\S]*Installed and launched/);
  assert.match(receipt, /iPad Pro 13-inch \(M5\)[\s\S]*iOS 26\.5[\s\S]*Installed and launched/);
  assert.match(packet, /`pnpm test`: PASS — 803 tests, 0 failures, 0 skipped\/todo/);
  assert.match(screenshotGate, /App Store.*accepted.*dimensions.*states.*metadata/i);
  assert.doesNotMatch(packet, /Simulator registration remains locally blocked/i);
  assert.doesNotMatch(packet, /current local native receipt:[\s\S]*?build FAILED/i);
  assert.doesNotMatch(packet, /Complete Xcode build[\s\S]*?BLOCKED by simulator registration/i);
  assert.doesNotMatch(packet, /Full Xcode is unavailable locally/i);
  assert.doesNotMatch(packet, /CocoaPods is unavailable/i);
});

test("iOS receipt distinguishes observed evidence source from an approved release freeze", () => {
  assert.match(receipt, /## Evidence source/);
  assert.doesNotMatch(receipt, /## Frozen source/);
  assert.match(packet, /\| Source freeze \| Not frozen \|/);
});
