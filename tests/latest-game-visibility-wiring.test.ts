import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

test("web latest-game conversion and persistence retain the pre-cutoff observation", async () => {
  const source = await readFile(new URL("../src/app/actions.ts", import.meta.url), "utf8");
  const conversion = source.slice(source.indexOf("function buildLatestGameCheckPayload"), source.indexOf("async function buildLatestGameChecks"));
  assert.match(conversion, /const observedGame = captureLatestGameObservation\(verdict\)/);
  const cutoffBranch = conversion.slice(conversion.indexOf('eligibility.status !== "eligible"'), conversion.indexOf("status: verdict.status"));
  assert.match(cutoffBranch, /observedGame/);
  assert.match(source.slice(source.indexOf("function pickProofReceiptFields"), source.indexOf("function buildLatestGameCheckPayload")), /observedGame: attempt.observedGame/);
});

test("web and mobile account projections consume the independent observation model", async () => {
  const web = await readFile(new URL("../src/app/page.tsx", import.meta.url), "utf8");
  const account = await readFile(new URL("../src/app/api/mobile/account/route.ts", import.meta.url), "utf8");
  assert.match(web, /latestGameVisibility=\{buildLatestGameVisibility\(getChallengeAttempts\(metadata\)\)\}/);
  assert.match(account, /latestGameVisibility: buildLatestGameVisibility\(attempts\)/);
});
