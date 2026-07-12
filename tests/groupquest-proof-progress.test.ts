import assert from "node:assert/strict";
import test from "node:test";

import { applyGroupQuestProofResults } from "../src/lib/groupquest-proof-progress";

const participant = {
  completedQuestIds: ["already-done"],
  questFinishedAt: { "already-done": "2026-07-01T10:00:00.000Z" },
  score: 100,
};

test("does not call mutation when every proof check mismatches", async () => {
  let mutationCalls = 0;
  const result = await applyGroupQuestProofResults({
    participant,
    checks: [{ questId: "new-quest", reward: 50, result: { status: "failed" as const, gameTime: "2026-07-02T10:00:00.000Z" } }],
    mutate: async () => { mutationCalls += 1; },
  });
  assert.equal(mutationCalls, 0);
  assert.equal(result.mutated, false);
  assert.deepEqual(result.completedQuestIds, ["already-done"]);
  assert.deepEqual(result.questFinishedAt, participant.questFinishedAt);
  assert.equal(result.score, 100);
});

test("does not call mutation when no eligible game is pending", async () => {
  let mutationCalls = 0;
  const result = await applyGroupQuestProofResults({
    participant,
    checks: [{ questId: "new-quest", reward: 50, result: { status: "pending" as const } }],
    mutate: async () => { mutationCalls += 1; },
  });
  assert.equal(mutationCalls, 0);
  assert.equal(result.mutated, false);
  assert.deepEqual(result.completedQuestIds, participant.completedQuestIds);
  assert.deepEqual(result.questFinishedAt, participant.questFinishedAt);
  assert.equal(result.score, participant.score);
});

test("adds passing proof without erasing prior completion state", async () => {
  let saved: unknown;
  const result = await applyGroupQuestProofResults({
    participant,
    checks: [{ questId: "new-quest", reward: 50, result: { status: "passed" as const, gameTime: "2026-07-02T10:00:00.000Z" } }],
    mutate: async (progress) => { saved = progress; },
  });
  assert.equal(result.mutated, true);
  assert.deepEqual(saved, {
    completedQuestIds: ["already-done", "new-quest"],
    questFinishedAt: {
      "already-done": "2026-07-01T10:00:00.000Z",
      "new-quest": "2026-07-02T10:00:00.000Z",
    },
    score: 150,
  });
});
