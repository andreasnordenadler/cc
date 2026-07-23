import assert from "node:assert/strict";
import test from "node:test";

import {
  buildActiveMultiplayerHomeRows,
  buildSoloProofHomeStatus,
  formatHomeTrophyMeta,
  loadHomeTrophyRows,
} from "../src/lib/mobile-web-home";
import { CHALLENGES } from "../src/lib/challenges";
import type { ServerGroupQuest } from "../src/lib/groupquests";

function quest(overrides: Partial<ServerGroupQuest> = {}): ServerGroupQuest {
  return {
    id: "quest-1",
    hostUserId: "host-user",
    hostName: "Host",
    name: "Friday Forks",
    inviteCopy: "Win material with a fork.",
    inviteMode: "public",
    questIds: ["knights-before-coffee"],
    providerMode: "both",
    providerLabel: "Lichess or Chess.com",
    startAt: "2026-07-10T12:00:00.000Z",
    endAt: "2026-07-20T12:00:00.000Z",
    rules: {},
    createdAt: "2026-07-09T12:00:00.000Z",
    participants: [],
    ...overrides,
  };
}

test("builds hosted and joined active multiplayer rows newest-first without mutating quests", () => {
  const hosted = quest({ id: "hosted", hostUserId: "me", name: "Hosted Quest", startAt: "2026-07-11T12:00:00.000Z" });
  const joined = quest({
    id: "joined",
    name: "Joined Quest",
    official: true,
    startAt: "2026-07-12T12:00:00.000Z",
    participants: [{
      userId: "me",
      provider: "lichess",
      username: "runner",
      leaderboardName: "Runner",
      joinedAt: "2026-07-10T12:00:00.000Z",
    }],
  });
  const original = [hosted, joined];

  const rows = buildActiveMultiplayerHomeRows(original, "me", Date.parse("2026-07-12T13:00:00.000Z"));

  assert.deepEqual(rows.map((row) => ({ id: row.id, status: row.status, sourceBadge: row.sourceBadge })), [
    { id: "joined", status: "Joined", sourceBadge: "Joined" },
    { id: "hosted", status: "Host", sourceBadge: "Hosted" },
  ]);
  assert.match(rows[0].meta, /SQC official/);
  assert.equal(rows[0].href, "/groupquests/joined?accepted=1");
  assert.deepEqual(original, [hosted, joined]);
});

test("excludes finished multiplayer quests without hiding active rows beyond the Android preview limit", () => {
  const quests = Array.from({ length: 7 }, (_, index) => quest({
    id: `quest-${index}`,
    hostUserId: "me",
    startAt: `2026-07-${String(10 + index).padStart(2, "0")}T12:00:00.000Z`,
    endAt: index === 0 ? "2026-07-11T12:00:00.000Z" : "2026-08-01T12:00:00.000Z",
  }));

  const rows = buildActiveMultiplayerHomeRows(quests, "me", Date.parse("2026-07-12T13:00:00.000Z"));

  assert.equal(rows.some((row) => row.id === "quest-0"), false);
  assert.deepEqual(rows.map((row) => row.id), ["quest-6", "quest-5", "quest-4", "quest-3", "quest-2", "quest-1"]);
});

test("Home trophy loader keeps rows beyond Android's five-item preview boundary", async () => {
  const client = {
    users: {
      getUserList: async () => ({ data: [], totalCount: 0 }),
    },
  };
  const completedChallengeIds = CHALLENGES.slice(0, 6).map((challenge) => challenge.id);

  const rows = await loadHomeTrophyRows(client, "viewer", completedChallengeIds);

  assert.equal(rows.length, 6);
  assert.deepEqual(rows.map((row) => row.href), completedChallengeIds.map((id) => `/challenges/${id}`));
});

test("distinguishes an unchecked solo quest from a check with no eligible game", () => {
  assert.deepEqual(buildSoloProofHomeStatus(false, null), {
    kind: "not-checked",
    label: "Not checked",
    tone: "neutral",
    detail: "Starting position shown until your next public game is available. Play on Lichess or Chess.com, then come back and refresh proof.",
  });

  assert.deepEqual(buildSoloProofHomeStatus(false, {
    status: "pending",
    headline: "Pending review",
    summary: "No public game was found after this Side Quest was picked.",
  }), {
    kind: "no-eligible-game",
    label: "No eligible game",
    tone: "neutral",
    detail: "No public game was found after this Side Quest was picked.",
  });
});

test("uses native trophy wording for real earned Solo and Multiplayer rows", () => {
  assert.equal(formatHomeTrophyMeta("Official Solo Side Quest · The First Game Shield", "solo"), "Unlocked The First Game Shield");
  assert.equal(formatHomeTrophyMeta("Multiplayer placement · 1st place", "multiplayer"), "Multiplayer placement · 1st place");
});

test("uses the latest failed diagnostic and completed headline on solo proof", () => {
  assert.deepEqual(buildSoloProofHomeStatus(false, {
    status: "failed",
    headline: "Latest game checked — Side Quest failed",
    summary: "The bishop never reached the target square.",
  }), {
    kind: "failed",
    label: "Not Completed",
    tone: "danger",
    detail: "The bishop never reached the target square.",
  });

  assert.deepEqual(buildSoloProofHomeStatus(true, {
    status: "failed",
    headline: "Older failed check",
    summary: "Older diagnostic",
  }), {
    kind: "completed",
    label: "Completed",
    tone: "good",
    detail: "Older failed check",
  });
});
