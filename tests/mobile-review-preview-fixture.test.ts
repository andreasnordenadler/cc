import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const appSource = readFileSync(new URL("../apps/mobile/App.tsx", import.meta.url), "utf8");
const accountSource = readFileSync(new URL("../src/app/account/page.tsx", import.meta.url), "utf8");
const settingsSource = readFileSync(new URL("../src/app/settings/page.tsx", import.meta.url), "utf8");
const proofShareSource = readFileSync(new URL("../src/lib/proof-share.ts", import.meta.url), "utf8");
const previewFixture = appSource.match(/function getDevTrackerPreviewAccount[\s\S]*?\n}\n\n\nfunction coerceAccountResponse/)?.[0] ?? "";

test("mobile review preview uses only clearly fictional non-personal account data", () => {
  assert.notEqual(previewFixture, "", "preview fixture should remain discoverable");
  assert.match(previewFixture, /displayName: "Review Knight"/);
  assert.match(previewFixture, /email: "review-knight@example\.com"/);
  assert.match(previewFixture, /lichessUsername: "reviewknight"/);
  assert.doesNotMatch(previewFixture, /Andreas|and72nor|andreas\.nordenadler@gmail\.com/);
});

test("mobile public input placeholders do not use a team member's identity", () => {
  assert.match(appSource, /placeholder="e\.g\. Knight Rider"/);
  assert.doesNotMatch(appSource, /placeholder="e\.g\. Andreas"/);
  assert.match(accountSource, /placeholder="e\.g\. Knight Rider"/);
  assert.match(settingsSource, /placeholder="e\.g\. Knight Rider"/);
  assert.doesNotMatch(`${accountSource}\n${settingsSource}`, /placeholder="e\.g\. Andreas"/);
});

test("public proof preview uses a fictional runner identity", () => {
  assert.match(proofShareSource, /runnerName: "Review Knight"/);
  assert.doesNotMatch(proofShareSource, /runnerName: "Andreas"/);
});
