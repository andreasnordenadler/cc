import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const packet = readFileSync(new URL("../docs/IOS_APP_STORE_RELEASE_PACKET_2026-08-21.md", import.meta.url), "utf8");
const nativeReceipt = packet.match(/### Disposable native-generation receipt([\s\S]*?)## 2\./)?.[1] ?? "";
const verificationReceipt = packet.match(/## 12\. Verification receipt for this branch([\s\S]*?)## 13\./)?.[1] ?? "";

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
  assert.match(packet, /Age Categories and Override.*Not Applicable/i);
  assert.match(packet, /1024.?×.?1024.*icon/i);
  assert.match(packet, /User Access.*Limited Access/i);
  assert.match(packet, /copyright ownership and year/i);
  assert.match(packet, /app-scoped App Manager/i);
  assert.match(packet, /must not download or export.*certificates.*profiles.*API keys.*credentials/i);
});

test("iOS release packet covers current app-record and age-rating decisions", () => {
  assert.match(packet, /Republic of Korea availability/i);
  assert.match(packet, /Content Rights.*provisional/i);
  assert.match(packet, /Horror\/Fear Themes/i);
  assert.match(packet, /Medical or Treatment Information/i);
  assert.match(packet, /Health or Wellness Topics/i);
  assert.match(packet, /Graphic Sexual Content and Nudity/i);
  assert.match(packet, /Cartoon or Fantasy Violence/i);
  assert.match(packet, /Realistic Violence/i);
  assert.match(packet, /Prolonged Graphic or Sadistic Realistic Violence/i);
});

test("iOS release packet records deployed safety disclosures without overstating privacy completion", () => {
  assert.match(packet, /report and block disclosures are deployed/i);
  assert.match(packet, /read back signed out on 2026-08-23/i);
  assert.match(packet, /processor description still does not clearly cover direct Google, Facebook, and Apple sign-in processing/i);
  assert.doesNotMatch(packet, /production deployment and signed-out readback remain blocked/i);
  assert.doesNotMatch(packet, /current privacy policy.*does not explicitly disclose content and creator reports/i);
});

test("iOS release packet records the current local Xcode and CocoaPods receipt without claiming a signed candidate", () => {
  assert.match(nativeReceipt, /Xcode 26\.6.*iOS 26\.5 SDK/i);
  assert.match(nativeReceipt, /CocoaPods 1\.17\.0/i);
  assert.match(nativeReceipt, /unsigned Debug and Release Simulator builds.*succeeded/i);
  assert.match(nativeReceipt, /installed and launched on iPhone 17 Pro and iPad Pro 13-inch/i);
  assert.match(nativeReceipt, /source commit `7a2c32cb77c296b484ba4ce71177f350a59c3a47`/i);
  assert.match(verificationReceipt, /85 dependencies\/84 pods/i);
  assert.match(verificationReceipt, /94D16E18-197E-43FD-A133-572FF0A7FBE4/i);
  assert.match(verificationReceipt, /02189F8B-B2ED-49AF-83B5-E630C8059EB1/i);
  assert.match(verificationReceipt, /OCR confirmed the rendered Side Quest Chess signed-out surface/i);
  assert.match(verificationReceipt, /unsigned Debug and Release Simulator builds PASS/i);
  assert.doesNotMatch(packet, /simulator runtime.*not.*registered/i);
  assert.doesNotMatch(packet, /production deployment and signed-out readback remain blocked/i);
  assert.doesNotMatch(packet, /changes remain under PR review/i);
  assert.doesNotMatch(packet, /Full Xcode is unavailable locally/i);
  assert.doesNotMatch(packet, /CocoaPods is unavailable/i);
  assert.match(packet, /no signed archive, IPA, TestFlight build, or physical-device evidence/i);
});
