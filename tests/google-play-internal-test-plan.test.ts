import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

const planPath = path.resolve("docs/SQC_GOOGLE_PLAY_INTERNAL_TEST_PLAN_CODE350_2026-08-12.md");

function section(document: string, heading: string) {
  const start = document.indexOf(`## ${heading}`);
  assert.notEqual(start, -1, `${heading} section must exist`);
  const end = document.indexOf("\n## ", start + heading.length + 3);
  return document.slice(start, end === -1 ? document.length : end);
}

test("internal-test record is bound to the published code-350 app and source", async () => {
  const plan = await readFile(planPath, "utf8");

  assert.match(plan, /Existing Play Console app: \*\*Side Quest Chess\*\* \(`com\.sidequestchess\.app`\), published by Crowdler AB/);
  assert.match(plan, /Published Internal testing release: `0\.1\.349` \/ Android version code `350`/);
  assert.match(plan, /EAS build: `462821e5-6e2a-47c2-bfb8-0c2debcb0e34`/);
  assert.match(plan, /Immutable source: `189c93a350eb48d2a325f3a3f4edd99ed110c4b5`/);
  assert.match(plan, /AAB SHA-256: `8003d55e46ed443dd34a9a9a6778334e5abf50081b417fd98685a2620778d01c`/);
  assert.match(plan, /Internal testing is complete; do not upload or publish code 350 again/i);
  assert.match(plan, /Production is inactive and unauthorized/i);
});

test("internal-test record preserves exactly the two approved testers", async () => {
  const plan = await readFile(planPath, "utf8");
  const testerSection = section(plan, "Tester baseline");
  const testerEmails = testerSection.match(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/gi) ?? [];

  assert.deepEqual(testerEmails.sort(), [
    "andreas.nordenadler@gmail.com",
    "samnordbot@gmail.com",
  ]);
  assert.match(testerSection, /Exactly these two approved testers must remain/i);
  assert.match(testerSection, /Do not add or remove testers without explicit owner approval/i);
  assert.doesNotMatch(testerSection, /sole member|only `samnordbot@gmail\.com`/i);
});

test("internal-test record captures physical-device approval without overstating responsive coverage", async () => {
  const plan = await readFile(planPath, "utf8");

  assert.match(plan, /Samsung Galaxy S24 Ultra/i);
  assert.match(plan, /enrolled, installed, launched, and approved/i);
  assert.match(plan, /launcher logo/i);
  assert.match(plan, /compact, narrow, standard, tall, wide, enlarged font, and enlarged display/i);
  assert.match(plan, /emulator-derived/i);
  assert.match(plan, /not a claim that every profile was physically tested/i);
});

test("future-candidate plan keeps product facts and external Play actions explicit", async () => {
  const plan = await readFile(planPath, "utf8");
  const candidateSection = section(plan, "Future candidate rule");
  const productionSection = section(plan, "Production-readiness contract");

  assert.match(candidateSection, /code `351` or later only after a substantive mobile source or release-input change/i);
  assert.match(productionSection, /Worldwide/);
  assert.match(productionSection, /13\+/);
  assert.match(productionSection, /free/i);
  assert.match(productionSection, /no ads, in-app purchases, subscriptions, or real-money prizes/i);
  assert.match(productionSection, /Swedish law/i);
  assert.match(productionSection, /Crowdler AB/);
  assert.match(productionSection, /`sam@crowdler\.com`/);
  assert.match(productionSection, /Google Play upload, Internal-track update, production rollout, store publication, tester mutation, and declaration changes require explicit owner approval/i);
  assert.match(productionSection, /no authority for app\/account creation, signing-key changes, legal or financial changes, secrets, destructive actions, or external communication/i);
  assert.doesNotMatch(plan, /owner approval (?:is |remains )?(?:optional|not required|unnecessary)|sole member|upload code 350 again[^.]*approved/i);
  assert.doesNotMatch(plan, /password|recovery code|session cookie|private key/i);
});
