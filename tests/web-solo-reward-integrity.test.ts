import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

import { getChallengeById } from "../src/lib/challenges";
import { buildChallengeProgressRecord } from "../src/lib/user-metadata";

test("shared Solo progress preserves custom rewards beside official rewards", () => {
  const official = getChallengeById("finish-any-game");
  assert.ok(official);

  assert.deepEqual(
    buildChallengeProgressRecord(["custom-win", official.id]),
    {
      completedChallengeIds: ["custom-win", official.id],
      totalCompletedChallenges: 2,
      totalRewardPoints: 100 + official.reward,
    },
  );
});

test("every web Solo progress write uses the shared custom-aware calculator", async () => {
  const source = await readFile(new URL("../src/app/actions.ts", import.meta.url), "utf8");
  const start = source.slice(
    source.indexOf("export async function startChallenge"),
    source.indexOf("export async function deactivateActiveChallenge"),
  );
  const submit = source.slice(
    source.indexOf("export async function submitChallengeAttempt"),
    source.indexOf("async function runActiveChallengeCheck"),
  );
  const reset = source.slice(
    source.indexOf("export async function resetCompletedChallenge"),
    source.indexOf("export async function submitChallengeAttempt"),
  );
  const refresh = source.slice(
    source.indexOf("async function runActiveChallengeCheck"),
    source.indexOf("export async function checkActiveChallenge"),
  );

  assert.match(source, /import\s*\{[\s\S]*?buildChallengeProgressRecord[\s\S]*?\}\s*from\s*"@\/lib\/user-metadata"/);
  assert.doesNotMatch(source, /function buildProgressRecord\s*\(/);
  for (const [name, action] of [["start", start], ["reset", reset], ["submit", submit], ["refresh", refresh]] as const) {
    assert.match(action, /challengeProgress:\s*buildChallengeProgressRecord\(completedChallengeIds\)/, `${name} must use the shared calculator`);
    assert.doesNotMatch(action, /totalRewardPoints:\s*completedChallengeIds\.reduce/, `${name} must not silently zero custom rewards`);
  }
});
