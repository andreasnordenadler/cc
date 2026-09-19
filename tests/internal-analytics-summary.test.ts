import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = readFileSync(new URL("../src/app/api/internal/analytics-summary/route.ts", import.meta.url), "utf8");

test("analytics summary requires the existing production monitor token", () => {
  assert.match(source, /process\.env\.SQC_SIGNUP_MONITOR_TOKEN/);
  assert.match(source, /authorization === `Bearer \$\{token\}`/);
  assert.match(source, /status: 401/);
});

test("analytics summary returns aggregate data without user identities", () => {
  assert.match(source, /totalAccounts/);
  assert.match(source, /activeTrackedUsersInWindow/);
  assert.match(source, /questStarts/);
  assert.match(source, /savedQuestCompletionReceipts/);
  assert.match(source, /getChallengeProgress/);
  assert.match(source, /getChallengeAttempts/);
  assert.match(source, /lowerBoundInWindowFromRetainedEvents/);
  assert.doesNotMatch(source, /primaryEmailAddress|emailAddress|firstName|lastName|username:/);
});

test("analytics summary documents historical-data limitations", () => {
  assert.match(source, /latest 12 detailed events/);
  assert.match(source, /no monthly buckets/);
  assert.match(source, /no campaign or UTM attribution/);
});
