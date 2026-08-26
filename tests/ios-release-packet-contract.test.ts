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
  assert.match(packet, /\| China mainland availability \| Blocked \|[^\n]*Owner\/legal-approved inclusion[^\n]*NPPA[^\n]*ICP/i);
  assert.match(packet, /Simplified Chinese localization[^\n]*primary language/i);
  assert.match(
    packet,
    /\| Vietnam availability \| Blocked \|[^\n]*Owner\/legal-approved inclusion[^\n]*game-publishing license[^\n]*exclude Vietnam/i,
  );
  assert.doesNotMatch(
    packet,
    /Vietnam[^\n]*(?:license number[^\n]*(?:associated )?URL|(?:associated )?URL[^\n]*license number)[^\n]*(?:description|metadata)/i,
  );
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
  assert.match(packet, /Source baseline:\*\* `444539e1a0ffade891ff934e0615efe71d610395` \(`origin\/main`/);
  assert.match(packet, /Historical source-equivalent local tooling receipt \(`5aee7255`/);
  assert.match(packet, /Historical source-equivalent Xcode receipt:/);
  assert.doesNotMatch(packet, /Current-baseline Xcode receipt:/);
  assert.match(packet, /changes from `5aee7255` through `444539e1`[^\n]*do not touch mobile or native build inputs/i);
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
  assert.match(packet, /Simulator compilation and basic launch: PASSED/i);
  assert.match(packet, /Simulator tests, archive[^\n]*NOT PASSED/i);
  assert.doesNotMatch(packet, /Complete Xcode build[^\n]*: PASSED/i);
});

test("iOS release packet blocks account deletion until retained safety identifiers are resolved", () => {
  assert.match(
    packet,
    /\| Account deletion \/ retained safety identifiers \| Blocked \|[^\n]*legally required retention[^\n]*scope[^\n]*duration[^\n]*user disclosure/i,
  );
  assert.match(packet, /Purge or anonymize[^\n]*legally required retention[^\n]*scope[^\n]*duration[^\n]*user disclosure/i);
  assert.match(packet, /concurrency-safe[^\n]*atomic[^\n]*Clerk metadata arrays/i);
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

test("iOS release packet preserves the remaining Apple-side submission gates", () => {
  assert.match(packet, /\| Apple agreements \| Blocked \|/i);
  assert.match(packet, /\| App Review information and access \| Blocked \|/i);
  assert.match(packet, /consent.*accessible withdrawal mechanism/i);
  assert.match(packet, /processed-upload readback[^\n]*version[^\n]*build[^\n]*export compliance/i);
  assert.match(packet, /September 2026[^\n]*social media[^\n]*required/i);
});

test("iOS release packet does not misattribute Google credential disconnection to Apple's social-network rule", () => {
  assert.match(packet, /revoke Facebook social-network credentials[^\n]*Guideline 5\.1\.1\(v\)/i);
  assert.match(packet, /Google credential disconnection[^\n]*Google[^\n]*account-deletion design/i);
  assert.doesNotMatch(packet, /Google and Facebook credentials[^\n]*required by Guideline 5\.1\.1\(v\)/i);
});

test("iOS release packet states the external TestFlight review trigger precisely", () => {
  assert.match(
    packet,
    /For external testing,[^\n]*first build submitted for a version[^\n]*TestFlight App Review[^\n]*Submit Review/i,
  );
  assert.match(packet, /first build added to a group[^.]*sent to review/i);
  assert.doesNotMatch(packet, /first build added or submitted to an external testing group requires full TestFlight App Review/i);
});

test("iOS release packet separately approval-gates EU trader verification and certification", () => {
  assert.match(packet, /EU trader status \| Blocked/i);
  assert.match(packet, /phone number and email[^\n]*verify both/i);
  assert.match(packet, /business[^\n]*address[^\n]*documentation/i);
  assert.match(packet, /payment account/i);
  assert.match(packet, /certif(?:y|ication)[^\n]*EU law/i);
  assert.match(packet, /separate approval/i);
});

test("iOS release packet preserves the canonical product facts in one explicit contract", () => {
  const section = packet.match(/## Canonical product facts contract\n([\s\S]*?)\n## 1\./)?.[1];

  assert.ok(section, "canonical product facts section must exist before section 1");
  assert.match(section, /\| Public app name \| Side Quest Chess \|/);
  assert.match(section, /\| Bundle ID candidate \| `com\.sidequestchess\.app` \|/);
  assert.match(section, /\| Expo scheme and auth callback \| `sidequestchess`; `sidequestchess:\/\/sso-callback` \|/);
  assert.match(section, /\| Publisher and controller \| Crowdler AB \|/);
  assert.match(section, /\| Minimum intended audience \| Worldwide 13\+ \|/);
  assert.match(section, /\| Privacy URL \| https:\/\/sidequestchess\.com\/privacy \|/);
  assert.match(section, /\| Support URL \| https:\/\/sidequestchess\.com\/support \|/);
  assert.match(section, /\| Terms URL \| https:\/\/sidequestchess\.com\/terms \|/);
  assert.match(section, /\| Monetization \| No ads, in-app purchases, subscriptions, or real-money activity \|/);
  assert.match(section, /Public copy must say `Side Quest Chess`, never `SQC`/);
});

test("iOS release packet requires exact-submission readback for every public listing URL", () => {
  assert.match(
    packet,
    /\| Public listing URLs \| Blocked \|[^\n]*Marketing[^\n]*Support[^\n]*Privacy[^\n]*Terms[^\n]*exact-submission/i,
  );
});

test("iOS release packet keeps public-name legal clearance separate from App Store availability", () => {
  assert.match(
    packet,
    /\| Public name legal clearance \| Blocked \|[^\n]*trademark[^\n]*App Store name availability[^\n]*not legal clearance/i,
  );
});

test("iOS release packet records the current frozen-install Simulator build without overstating device or test evidence", () => {
  assert.match(packet, /frozen dependency install[^\n]*5edd63864c5af4d5a85718e5af02bc769ae7634d8b8b60349a4f08c03d3317e9/i);
  assert.match(packet, /iPhone 17e[^\n]*iOS 26\.5[^\n]*build succeeded/i);
  assert.match(packet, /Metro[^\n]*974 modules/i);
  assert.match(packet, /no XCTest or Swift Testing targets?[^\n]*executed/i);
  assert.match(packet, /not[^\n]*(?:TestFlight|physical-iPhone|archive|signing) evidence/i);
});
