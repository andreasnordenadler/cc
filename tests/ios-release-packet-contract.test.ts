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

test("iOS release packet records the exact current unsigned Simulator candidate without claiming store evidence", () => {
  const nativeReceipt = packet.match(/^- Exact-current-source native receipt .*$/m)?.[0] ?? "";
  const sourceReceipt = packet.match(/^- Source tests on this exact baseline:.*$/m)?.[0] ?? "";
  const screenshotReceipt = packet.match(/^- Simulator screenshots .*$/m)?.[0] ?? "";

  assert.match(nativeReceipt, /c5ff2b038aafed06a8a4c2b6400a301c974e300b/);
  assert.match(nativeReceipt, /Xcode 26\.6.*iOS 26\.5 runtime/i);
  assert.match(nativeReceipt, /CocoaPods 1\.17\.0.*85 dependencies\/84 pods/i);
  assert.match(nativeReceipt, /unsigned.*Simulator build.*SUCCEEDED.*92 targets/i);
  assert.match(nativeReceipt, /iPhone 17e.*iOS 26\.5/i);
  assert.match(nativeReceipt, /install and launch PASS.*com\.sidequestchess\.app/i);
  assert.match(nativeReceipt, /Metro bundled 974 modules/i);
  assert.match(nativeReceipt, /sidequestchess:\/\/sso-callback.*OS dispatch succeeded.*app remained running/i);
  assert.match(nativeReceipt, /Side Quest Chess.*0\.1\.349 \(1\).*minimum iOS 15\.1.*device family `1,2`/i);
  assert.match(nativeReceipt, /no valid local Apple signing identity/i);
  assert.match(nativeReceipt, /no signed archive, IPA.*TestFlight build.*physical-device proof/i);
  assert.match(sourceReceipt, /797 tests, 0 failures, 0 skipped\/todo.*mobile typecheck PASS/i);
  assert.match(screenshotReceipt, /persisted non-fixture account state/i);
  assert.match(screenshotReceipt, /must not be committed or used as release evidence/i);
  assert.match(packet, /TestFlight \| Not started/i);
  assert.doesNotMatch(packet, /Simulator registration remains locally blocked/i);
  assert.doesNotMatch(packet, /unsigned generic Simulator build FAILED/i);
});
