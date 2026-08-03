import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

const planPath = path.resolve("docs/SQC_GOOGLE_PLAY_INTERNAL_TEST_PLAN_V347_2026-08-03.md");

test("internal-test plan is bound to the current code-347 AAB and existing Play app", async () => {
  const plan = await readFile(planPath, "utf8");

  assert.match(plan, /Existing Play Console app: \*\*Side Quest Chess\*\* \(`com\.sidequestchess\.app`\), published by Crowdler AB/);
  assert.match(plan, /Candidate: `0\.1\.346` \/ Android version code `347`/);
  assert.match(plan, /EAS build: `691d9598-fe32-4d8c-949a-ff840384869c`/);
  assert.match(plan, /Immutable source: `6a0888cb2b76a667168806b7da186dbd3583c451`/);
  assert.match(plan, /AAB SHA-256: `87353e5b90e6769063524fd830a663b449c4088b3c9c60a2310beca0cef6d316`/);
  assert.match(plan, /Never create another developer account, app, package, or listing/);
  assert.doesNotMatch(plan, /code[- ]?34[1-6]|0\.1\.34[0-5]|mobile-v34[0-5]-code34[1-6]/i);
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
