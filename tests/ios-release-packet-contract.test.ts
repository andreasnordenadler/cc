import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import test from "node:test";

const packet = readFileSync(new URL("../docs/IOS_APP_STORE_RELEASE_PACKET_2026-08-21.md", import.meta.url), "utf8");
const nativeReceipt = JSON.parse(readFileSync(new URL("../docs/evidence/ios-simulator-757698da.json", import.meta.url), "utf8")) as {
  sourceBaseline: string;
  sourceGitTree: string;
  sourceMobileTree: string;
  sourceFiles: Record<string, string>;
  commands: Array<{ name: string; exitCode: number; logPath: string; logSha256: string }>;
  destinations: Array<{ name: string; udid: string; configuration: string }>;
  screenshots: Array<{ scenario: string; localPath: string; sha256: string; pixels: string }>;
  app: {
    bundleIdentifier: string;
    displayName: string;
    shortVersion: string;
    buildVersion: string;
    minimumOSVersion: string;
    deviceFamily: string[];
    urlSchemes: string[];
    mainJsBundleSha256: string;
    signed: boolean;
  };
};

function sha256(path: string) {
  return createHash("sha256").update(readFileSync(new URL(`../${path}`, import.meta.url))).digest("hex");
}
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
  assert.match(header, /Source baseline.*757698da73182520e4418e68165c5a5c4cb0e23a/);
  assert.match(header, /source-preparation changes.*merged/i);
  assert.doesNotMatch(header, /70545c4e50addce85ae2fdade56345b7293e3b2c/);
  assert.doesNotMatch(header, /source-preparation changes remain under PR review/i);
});

test("iOS native receipt binds its source tree and records successful local commands and inspected app identity", () => {
  assert.equal(nativeReceipt.sourceBaseline, "757698da73182520e4418e68165c5a5c4cb0e23a");
  assert.equal(nativeReceipt.sourceGitTree, "34188c036476a5357c63764345c0db5028f18f84");
  assert.equal(
    nativeReceipt.sourceGitTree,
    execFileSync("git", ["rev-parse", `${nativeReceipt.sourceBaseline}^{tree}`], { encoding: "utf8" }).trim(),
  );
  assert.equal(
    nativeReceipt.sourceMobileTree,
    execFileSync("git", ["rev-parse", `${nativeReceipt.sourceBaseline}:apps/mobile`], { encoding: "utf8" }).trim(),
  );
  assert.equal(nativeReceipt.sourceMobileTree, execFileSync("git", ["rev-parse", "HEAD:apps/mobile"], { encoding: "utf8" }).trim());
  for (const path of ["apps/mobile/app.json", "apps/mobile/package.json", "pnpm-lock.yaml"]) {
    assert.equal(nativeReceipt.sourceFiles[path], sha256(path), `${path} does not match the native receipt`);
  }
  assert.deepEqual(nativeReceipt.commands.map(({ name, exitCode }) => [name, exitCode]), [
    ["pnpm install --frozen-lockfile", 0],
    ["pnpm test", 0],
    ["pnpm --dir apps/mobile typecheck", 0],
    ["pnpm --dir apps/mobile doctor", 0],
    ["expo prebuild --platform ios --clean --no-install", 0],
    ["pod install", 0],
    ["xcodebuild Debug iPhone 17e", 0],
    ["xcodebuild Release iPhone 17e", 0],
    ["simctl install iPhone 17e", 0],
    ["simctl launch iPhone 17e", 0],
    ["simctl install iPad Pro 13-inch (M5)", 0],
    ["simctl launch iPad Pro 13-inch (M5)", 0],
    ["simctl openurl sidequestchess://sso-callback", 0],
  ]);
  for (const command of nativeReceipt.commands) {
    assert.match(command.logPath, /^\/Users\/sam\/Projects\/sqc-build-evidence\/ios-current-757698da\/logs\/.+\.log$/);
    assert.match(command.logSha256, /^[a-f0-9]{64}$/);
  }
  assert.deepEqual(nativeReceipt.destinations, [
    { name: "iPhone 17e", udid: "25423278-D058-4FD7-95FE-7BA695DA23CE", configuration: "Release" },
    { name: "iPad Pro 13-inch (M5)", udid: "02189F8B-B2ED-49AF-83B5-E630C8059EB1", configuration: "Release" },
  ]);
  assert.deepEqual(nativeReceipt.app, {
    bundleIdentifier: "com.sidequestchess.app",
    displayName: "Side Quest Chess",
    shortVersion: "0.1.349",
    buildVersion: "1",
    minimumOSVersion: "15.1",
    deviceFamily: ["1", "2"],
    urlSchemes: ["sidequestchess", "com.sidequestchess.app"],
    mainJsBundleSha256: "272bb37105a1bb6d45ec09a2be3f95a5ababa62c824be4bfc79bc20655c3bd92",
    signed: false,
  });
  assert.deepEqual(nativeReceipt.screenshots, [
    {
      scenario: "iPhone 17e signed-out home",
      localPath: "/Users/sam/Projects/sqc-worktrees/ios-candidate-757698da-20260823/ios-757698da-iphone17e-home.png",
      sha256: "f239c5a74d6a62977ad1f87d024fdb4cce93b4e019c6432d764a27b5e39ba7e3",
      pixels: "1170x2532",
    },
    {
      scenario: "iPad Pro 13-inch (M5) portrait signed-out entry",
      localPath: "/Users/sam/Projects/sqc-worktrees/ios-candidate-757698da-20260823/ios-757698da-ipad13-portrait.png",
      sha256: "83056a6eb631ed31c91fe02db861026816fa9aa0e0547dc9b8407e82f572cec0",
      pixels: "2064x2752",
    },
    {
      scenario: "iPad Pro 13-inch (M5), light system appearance, accessibility-extra-extra-extra-large",
      localPath: "/Users/sam/Projects/sqc-worktrees/ios-candidate-757698da-20260823/ios-757698da-ipad13-axxxl-light.png",
      sha256: "49ea8d3dabc511acee559675e38ca079189a8a2ff972638da380828536542d1c",
      pixels: "2064x2752",
    },
    {
      scenario: "iPhone 17e callback scheme confirmation",
      localPath: "/Users/sam/Projects/sqc-worktrees/ios-candidate-757698da-20260823/ios-757698da-callback-settled.png",
      sha256: "fda3566726bc068f59cbbb9beb7626b6a157d6c0cc30fc3853fd81ec038a099c",
      pixels: "1170x2532",
    },
  ]);
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
  assert.match(verifiedBaseline, /Release app.*installed and launched on iPhone 17e/i);
  assert.match(verifiedBaseline, /sidequestchess:\/\/sso-callback.*confirmation.*scheme association/i);
  assert.match(verificationReceipt, /full URL handoff and authentication remain unverified/i);
  assert.match(verificationReceipt, /No signed archive, IPA/);
  assert.doesNotMatch(packet, /Full Xcode is unavailable locally/i);
  assert.doesNotMatch(packet, /CocoaPods is unavailable/i);
  assert.doesNotMatch(packet, /Simulator registration remains locally blocked/i);
});
