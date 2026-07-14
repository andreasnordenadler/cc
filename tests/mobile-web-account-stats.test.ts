import assert from "node:assert/strict";
import test from "node:test";

import { summarizeMobileWebAccountStats } from "../src/lib/mobile-web-trophies";

test("summarizes Android-matched Account progress from canonical quest data", () => {
  const stats = summarizeMobileWebAccountStats({
    completedChallengeIds: ["official-win", "custom-alpha"],
    attempts: [
      { challengeId: "official-win" },
      { challengeId: "custom-alpha" },
      { id: "custom-alpha:second-check" },
      { challengeId: "custom-beta" },
    ],
    customSideQuestIds: ["custom-alpha", "custom-beta"],
    multiplayerTrophyCount: 2,
    groupQuests: [
      {
        questIds: ["custom-alpha"],
        participants: [
          { completedQuestIds: ["custom-alpha"] },
          { completedQuestIds: [] },
        ],
      },
      {
        questIds: ["custom-alpha", "custom-beta"],
        participants: [
          { completedQuestIds: ["custom-beta"] },
          { completedQuestIds: ["custom-alpha", "custom-beta"] },
          { completedQuestIds: [] },
        ],
      },
    ],
  });

  assert.deepEqual(stats, {
    completedCount: 2,
    proofCount: 4,
    coatCount: 4,
    podiumCount: 2,
    customQuestCount: 2,
    customTries: 11,
    customWins: 5,
  });
});

test("caps Multiplayer podium stats at the Android account payload limit", () => {
  const stats = summarizeMobileWebAccountStats({
    completedChallengeIds: ["solo-win"],
    attempts: [],
    customSideQuestIds: [],
    multiplayerTrophyCount: 13,
    groupQuests: [],
  });

  assert.equal(stats.podiumCount, 12);
  assert.equal(stats.coatCount, 13);
});

test("counts a participant fulfillment once even if malformed progress repeats a quest id", () => {
  const stats = summarizeMobileWebAccountStats({
    completedChallengeIds: [],
    attempts: [],
    customSideQuestIds: ["custom-alpha"],
    multiplayerTrophyCount: 0,
    groupQuests: [{
      questIds: ["custom-alpha"],
      participants: [{ completedQuestIds: ["custom-alpha", "custom-alpha"] }],
    }],
  });

  assert.equal(stats.customWins, 1);
});

test("does not count unrelated Solo attempts or Multiplayer lineups as custom progress", () => {
  const stats = summarizeMobileWebAccountStats({
    completedChallengeIds: ["official-only"],
    attempts: [{ challengeId: "official-only" }, { id: "legacy-official:attempt" }],
    customSideQuestIds: [],
    multiplayerTrophyCount: 0,
    groupQuests: [{ questIds: ["official-only"], participants: [{ completedQuestIds: ["official-only"] }] }],
  });

  assert.deepEqual(stats, {
    completedCount: 1,
    proofCount: 2,
    coatCount: 1,
    podiumCount: 0,
    customQuestCount: 0,
    customTries: 0,
    customWins: 0,
  });
});
