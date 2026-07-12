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

test("passes only newly completed quest IDs into metadata mutations", async () => {
  let newlyPassedQuestIds: string[] | undefined;
  const result = await applyGroupQuestProofResults({
    participant,
    checks: [
      { questId: "already-done", reward: 100, result: { status: "passed" as const, gameTime: "2026-07-02T09:00:00.000Z" } },
      { questId: "new-quest", reward: 50, result: { status: "passed" as const, gameTime: "2026-07-02T10:00:00.000Z" } },
    ],
    mutate: async (_progress, mutation) => { newlyPassedQuestIds = mutation.newlyPassedQuestIds; },
  });
  assert.deepEqual(newlyPassedQuestIds, ["new-quest"]);
  assert.deepEqual(result.newlyPassedQuestIds, ["new-quest"]);
});

test("deduplicates duplicate newly passing quest IDs", async () => {
  const result = await applyGroupQuestProofResults({
    participant: { completedQuestIds: [], questFinishedAt: {}, score: 0 },
    checks: [
      { questId: "duplicate", reward: 50, result: { status: "passed" as const, gameTime: "2026-07-03T00:00:00.000Z" } },
      { questId: "duplicate", reward: 50, result: { status: "passed" as const, gameTime: "2026-07-04T00:00:00.000Z" } },
    ],
    mutate: async () => {},
  });
  assert.deepEqual(result.completedQuestIds, ["duplicate"]);
  assert.equal(result.score, 50);
  assert.deepEqual(result.questFinishedAt, { duplicate: "2026-07-03T00:00:00.000Z" });
  assert.deepEqual(result.newlyPassedQuestIds, ["duplicate"]);
});
