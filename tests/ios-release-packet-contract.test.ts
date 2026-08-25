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
  assert.match(packet, /\| Android and web public launch \| Blocked \|[^\n]*verified public availability[^\n]*iOS App Review submission[^\n]*public release/i);
});

test("iOS release packet never makes Andreas's personal Apple identity an approvable path", () => {
  assert.match(packet, /Andreas(?:'s|’s) personal Apple identity[^\n]*prohibited/i);
  assert.doesNotMatch(packet, /approval is required before[^\n]*using Andreas(?:'s|’s) personal Apple identity/i);
});

test("iOS release packet approval-gates the remaining app-record and privacy-policy facts", () => {
  assert.match(packet, /Made for Kids.*No/i);
  assert.match(packet, /1024.?×.?1024.*icon/i);
  assert.match(packet, /User Access selection/i);
  assert.match(packet, /copyright ownership and year/i);
  assert.match(packet, /app-scoped App Manager/i);
  assert.match(packet, /must not download or export.*certificates.*profiles.*API keys.*credentials/i);
});

test("iOS release packet records verified signed-out production safety and support readback", () => {
  assert.match(
    packet,
    /Production signed-out readback verified on 2026-08-25:[^\n]*https:\/\/sidequestchess\.com\/support[^\n]*Crowdler AB[^\n]*sam@crowdler\.com[^\n]*Kvarnängsvägen 15/i,
  );
  assert.match(
    packet,
    /\| Privacy policy safety data \| Production readback verified; source behavior blocked \| Report and block disclosures are deployed in production and readable signed out;[^\n]*moderation workflow remain blockers/i,
  );
  assert.match(packet, /Report and block disclosures are deployed in production and were read successfully while signed out on 2026-08-25/i);
  assert.doesNotMatch(packet, /production deployment and signed-out readback remain blocked/i);
  assert.doesNotMatch(packet, /source fix pending deployment/i);
  assert.doesNotMatch(packet, /current privacy policy.*does not explicitly disclose content and creator reports/i);
});

test("iOS release packet is bound to the exact current origin main source", () => {
  assert.match(packet, /Source baseline:\*\* `5aee72552afd8c33496eb536a8bc190032cf7e69` \(`origin\/main`/);
  assert.match(packet, /Current-baseline local tooling receipt \(`5aee7255`/);
  assert.doesNotMatch(packet, /current `origin\/main`[^\n]*`4f62e560`/i);
});

test("iOS release packet records current local tooling without turning inconclusive build evidence into a pass", () => {
  assert.match(packet, /Xcode 26\.6.*iOS 26\.5 SDK/i);
  assert.match(packet, /CocoaPods 1\.17\.0/i);
  assert.match(packet, /iOS 26\.5 Simulator runtime.*registered/i);
  assert.match(packet, /historical build attempt[^\n]*xcresult[^\n]*zero tests[^\n]*unknown/i);
  assert.doesNotMatch(packet, /existing `ios-build-[^`]+\.xcresult`/i);
  assert.doesNotMatch(packet, /simulator runtime.*not.*registered/i);
  assert.doesNotMatch(packet, /Full Xcode is unavailable locally/i);
  assert.doesNotMatch(packet, /CocoaPods is unavailable/i);
  assert.match(packet, /Complete Xcode build[^\n]*: NOT PASSED/i);
  assert.doesNotMatch(packet, /Complete Xcode build[^\n]*: PASSED/i);
});

test("iOS release packet blocks account deletion until retained safety identifiers are resolved", () => {
  assert.match(
    packet,
    /\| Account deletion \/ retained safety identifiers \| Blocked \|[^\n]*legally required retention[^\n]*scope[^\n]*duration[^\n]*user disclosure/i,
  );
  assert.match(packet, /Purge or anonymize[^\n]*legally required retention[^\n]*scope[^\n]*duration[^\n]*user disclosure/i);
});

test("iOS release packet territory-gates South Korea availability without assuming an RCN is required", () => {
  assert.match(packet, /\| Republic of Korea availability \| Blocked \|[^\n]*verify whether[^\n]*RCN[^\n]*exclude Korea/i);
  assert.match(packet, /manage-korea-compliance-information/);
  assert.doesNotMatch(packet, /manage-information-for-apps-in-south-korea/);
});

test("iOS release packet treats accessibility nutrition labels as voluntary and evidence-bound", () => {
  assert.match(packet, /Accessibility Nutrition Labels.*currently voluntary/i);
  assert.match(packet, /iPhone.*iPad.*common-task evaluation/i);
  assert.match(packet, /not indicated/i);
});
