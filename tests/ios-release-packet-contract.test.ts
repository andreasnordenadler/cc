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

test("iOS release packet records the current local Xcode, runtime, and unsigned build receipt without claiming distribution", () => {
  assert.match(packet, /Xcode 26\.6.*iOS 26\.5 SDK/i);
  assert.match(packet, /CocoaPods 1\.17\.0/i);
  assert.match(packet, /iOS 26\.5.*runtime.*registered/i);
  assert.match(packet, /unsigned Release Simulator build.*pass/i);
  assert.match(packet, /iPhone 17 Pro.*iPad mini.*iPad Pro 13-inch/i);
  assert.match(packet, /No signed archive.*TestFlight.*physical-iPhone/i);
  assert.doesNotMatch(packet, /Simulator registration remains locally blocked/i);
  assert.doesNotMatch(packet, /simulator runtime.*not.*registered/i);
  assert.doesNotMatch(packet, /Full Xcode is unavailable locally/i);
  assert.doesNotMatch(packet, /CocoaPods is unavailable/i);
});

test("iOS release packet treats Andreas's personal Apple identity as prohibited rather than approvable", () => {
  assert.match(packet, /Do not use Andreas[’']s personal Apple identity/i);
  assert.doesNotMatch(packet, /Written approval is required before:[\s\S]*using Andreas[’']s personal Apple identity/i);
});

test("iOS release packet records keyboard-safe forms without claiming device verification", () => {
  assert.match(packet, /keyboard taps.*iOS keyboard insets/i);
  assert.match(packet, /real-iPhone and iPad.*remain.*blocked/i);
});
