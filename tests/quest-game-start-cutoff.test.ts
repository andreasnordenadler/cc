import assert from "node:assert/strict";
import test from "node:test";

import {
  evaluateQuestGameStartEligibility,
  getMultiplayerQuestStartCutoff,
} from "../src/lib/quest-game-start-cutoff";

const cutoff = "2026-09-19T10:00:00.000Z";

for (const provider of ["lichess", "chess.com"] as const) {
  test(`${provider} only accepts authoritative game starts strictly after the persisted cutoff`, () => {
    assert.equal(evaluateQuestGameStartEligibility({
      gameStartedAt: "2026-09-19T09:59:59.999Z",
      questStartedAt: cutoff,
    }).status, "before_cutoff");
    assert.equal(evaluateQuestGameStartEligibility({
      gameStartedAt: cutoff,
      questStartedAt: cutoff,
    }).status, "before_cutoff");
    assert.equal(evaluateQuestGameStartEligibility({
      gameStartedAt: "2026-09-19T10:00:00.001Z",
      questStartedAt: cutoff,
    }).status, "eligible");
  });
}

test("a game started before the quest stays ineligible when it finishes afterward", () => {
  const result = evaluateQuestGameStartEligibility({
    gameStartedAt: "2026-09-19T09:59:00.000Z",
    gameCompletedAt: "2026-09-19T10:15:00.000Z",
    questStartedAt: cutoff,
  });

  assert.equal(result.status, "before_cutoff");
});

test("equivalent timezone offsets compare as the same UTC instant", () => {
  const result = evaluateQuestGameStartEligibility({
    gameStartedAt: "2026-09-19T12:00:00+02:00",
    questStartedAt: cutoff,
  });

  assert.equal(result.status, "before_cutoff");
});

test("missing or malformed authoritative timestamps fail closed with actionable reasons", () => {
  assert.deepEqual(evaluateQuestGameStartEligibility({
    gameStartedAt: undefined,
    gameCompletedAt: "2026-09-19T10:15:00.000Z",
    questStartedAt: cutoff,
  }), {
    status: "game_start_unconfirmed",
    message: "The chess provider did not supply a valid authoritative game-start time. Play a fresh public game, then check again.",
  });
  assert.deepEqual(evaluateQuestGameStartEligibility({
    gameStartedAt: "not-a-date",
    questStartedAt: cutoff,
  }), {
    status: "game_start_unconfirmed",
    message: "The chess provider did not supply a valid authoritative game-start time. Play a fresh public game, then check again.",
  });
  assert.deepEqual(evaluateQuestGameStartEligibility({
    gameStartedAt: "2026-09-19T10:01:00.000Z",
    questStartedAt: "not-a-date",
  }), {
    status: "quest_start_unconfirmed",
    message: "This quest has no valid persisted start time. Restart or rejoin the quest before checking a game.",
  });
});

test("Solo rechecks preserve the persisted quest start across serialization", () => {
  const persisted = JSON.parse(JSON.stringify({ activeChallenge: { startedAt: cutoff } })) as {
    activeChallenge: { startedAt: string };
  };

  assert.equal(evaluateQuestGameStartEligibility({
    gameStartedAt: "2026-09-19T10:00:01.000Z",
    questStartedAt: persisted.activeChallenge.startedAt,
  }).status, "eligible");
});

for (const official of [true, false] as const) {
  test(`${official ? "official" : "community"} Multiplayer uses the user's persisted join time`, () => {
    const participant = JSON.parse(JSON.stringify({ joinedAt: "2026-09-19T10:05:00.000Z" })) as { joinedAt: string };
    const quest = { official, startAt: "2026-09-19T09:00:00.000Z" };

    assert.equal(getMultiplayerQuestStartCutoff(quest, participant), participant.joinedAt);
    assert.equal(evaluateQuestGameStartEligibility({
      gameStartedAt: "2026-09-19T10:03:00.000Z",
      questStartedAt: getMultiplayerQuestStartCutoff(quest, participant),
    }).status, "before_cutoff");
  });
}
