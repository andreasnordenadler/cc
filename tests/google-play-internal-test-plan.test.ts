import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

const planPath = path.resolve("docs/SQC_GOOGLE_PLAY_INTERNAL_TEST_PLAN_V348_2026-08-05.md");

function assertOwnerGateNotContradicted(text: string) {
  for (const line of text.split("\n")) {
    const normalized = line.toLowerCase().replace(/[^a-z0-9]+/g, " ");
    assert.doesNotMatch(normalized, /owner approval (?:is )?(?:optional|not required)/);
    assert.doesNotMatch(normalized, /(?:upload|roll out|tester list mutation|mutate the tester list|declaration submission|submit declarations?|publication|publish).*?(?:before|without).*?owner approval/);
  }
}

test("internal-test plan is bound to the current code-349 AAB and existing Play app", async () => {
  const plan = await readFile(planPath, "utf8");

  assert.match(plan, /Existing Play Console app: \*\*Side Quest Chess\*\* \(`com\.sidequestchess\.app`\), published by Crowdler AB/);
  assert.match(plan, /Candidate: `0\.1\.348` \/ Android version code `349`/);
  assert.match(plan, /EAS build: `dd277377-25fb-4923-a1ec-10b930c25563`/);
  assert.match(plan, /Immutable source: `4925cd13b6a39a8be1658ac46c0bea396260dbd2`/);
  assert.match(plan, /AAB SHA-256: `c416609b1240114612f888c8a0fff205fafe0a8821ee4065cb833b395f7cbf71`/);
  assert.match(plan, /AAB: `apps\/mobile\/artifacts\/android\/mobile-v348-code349\/side-quest-chess-android-v348-code349\.aab`/);
  assert.match(plan, /Never create another developer account, app, package, or listing/);
  const supersededGuard = "do not upload the superseded `0.1.347 (348)` candidate";
  const normalizedPlan = plan.toLowerCase();
  assert.equal(normalizedPlan.split(supersededGuard).length - 1, 1);
  assert.equal(plan.match(/0\.1\.347 \(348\)/g)?.length, 1);
  const planWithoutSupersededGuard = normalizedPlan.replace(supersededGuard, "");
  assert.doesNotMatch(planWithoutSupersededGuard, /0\.1\.347|android[- `:]*348|(?:android )?version(?: code)?[- `:]*348|code[- `:]*348|mobile-v347-code348/);
  assert.match(plan, /parsed identity[^\n]*package `com\.sidequestchess\.app`, version name `0\.1\.348`, and version code `349`/i);
  assert.match(plan, /installed version is `0\.1\.348 \(349\)`/i);
  assert.match(plan, /Play delivered code 349 through Internal testing/);
  assert.doesNotMatch(plan, /code[- ]?34[1-7]|0\.1\.34[0-6]|mobile-v34[0-6]-code34[1-7]/i);
  assert.doesNotMatch(plan, /c8290195-f35b-48b5-961d-907b7adb532b|c8755b7175fc6902ec391c8ba2dc69488faf13dd0be78d321507026c89bb5576|5ece97b95de996b630775359e312a001e58ff59c/);
});

test("internal-test plan separates upload signing from Play app signing", async () => {
  const plan = await readFile(planPath, "utf8");

  assert.match(plan, /Upload certificate SHA-256: `89:1F:DC:5A:80:60:1E:AA:2B:6D:B1:F3:FC:B2:6A:B7:56:65:01:79:B4:0B:3A:3F:5F:58:DD:92:1D:75:3C:F2`/);
  assert.match(plan, /record the app signing key certificate SHA-256 separately/i);
  assert.match(plan, /installed certificate must match the app signing certificate, not the upload certificate/i);
  assert.match(plan, /installer package[^\n]*`com\.android\.vending`/i);
});

test("internal-test plan uses bounded non-sensitive accounts and preserves owner gates", async () => {
  const plan = await readFile(planPath, "utf8");

  assert.match(plan, /Primary tester: `samnordbot@gmail\.com`/);
  assert.match(plan, /Support, privacy, and moderation contact: `sam@crowdler\.com`/);
  assert.match(plan, /disposable, non-sensitive secondary Side Quest Chess account/i);
  assert.match(plan, /no Play Console role, payment method, real personal data, or access to real-user records/i);
  assert.match(plan, /Google Play upload, tester-list mutation, Internal testing rollout, declaration submission, and publication require explicit owner approval/i);
  assert.match(plan, /stop before rollout/i);
  assertOwnerGateNotContradicted(plan);
  for (const contradiction of [
    "Owner approval: optional.",
    "Owner approval — not required.",
    "Tester-list mutation before owner approval.",
    "Publish without owner approval.",
  ]) {
    assert.throws(() => assertOwnerGateNotContradicted(contradiction));
  }
  assert.doesNotMatch(plan, /password|recovery code|session cookie|private key/i);
});

test("Play-delivered acceptance retains the complete Android responsive matrix", async () => {
  const plan = await readFile(planPath, "utf8");

  for (const required of [
    "compact/narrow",
    "standard",
    "tall",
    "wide",
    "enlarged font scale",
    "enlarged display scale",
    "wrapping",
    "clipping",
    "overlap",
    "keyboard",
    "Android Back",
    "crashes",
    "ANRs",
    "freezes",
  ]) {
    assert.ok(plan.includes(required), `plan must include ${required}`);
  }

  assert.match(plan, /Play-delivered install/i);
  assert.match(plan, /active Solo Side Quest/i);
  assert.match(plan, /screenshots for every profile/i);
  assert.match(plan, /AAB alone is not a Play-delivered acceptance pass/i);
});
