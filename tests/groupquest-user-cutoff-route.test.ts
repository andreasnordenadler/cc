import assert from "node:assert/strict";
import test from "node:test";

import * as webRoute from "../src/app/api/groupquests/[id]/refresh/route";
import * as mobileRoute from "../src/app/api/mobile/groupquests/[id]/route";

Object.defineProperty(process.env, "NODE_ENV", { value: "test", writable: true, configurable: true, enumerable: true });

for (const variant of ["web", "mobile"] as const) {
  for (const official of [true, false] as const) {
    test(`${variant} ${official ? "official" : "community"} refresh uses the persisted participant join cutoff`, async () => {
      const joinedAt = "2026-09-19T10:05:00.000Z";
      const quest = {
        id: official ? "official-cutoff" : "community-cutoff",
        hostUserId: official ? "official-sqc" : "host",
        hostName: "Host",
        name: "Cutoff quest",
        inviteMode: "public" as const,
        providerMode: "lichess" as const,
        providerLabel: "Lichess",
        questIds: ["finish-any-game"],
        startAt: "2026-09-19T09:00:00.000Z",
        endAt: "2026-09-20T09:00:00.000Z",
        createdAt: "2026-09-18T09:00:00.000Z",
        rules: {},
        official,
        participants: [{
          userId: "current",
          provider: "lichess" as const,
          username: "CurrentLichess",
          leaderboardName: "Current",
          joinedAt,
          score: 0,
          completedQuestIds: [],
          questFinishedAt: {},
        }],
      };
      const seenCutoffs: Array<string | undefined> = [];
      const dependencies = {
        authenticate: async () => "current",
        getClient: async () => ({
          users: {
            getUser: async () => ({ publicMetadata: {}, privateMetadata: {} }),
          },
        }),
        findQuest: async () => ({ userId: quest.hostUserId, groupQuest: quest }),
        check: async (input: { startAt?: string }) => {
          seenCutoffs.push(input.startAt);
          return { status: "pending" as const, gameId: "fresh-game-required", summary: "Play a fresh game." };
        },
      };
      const request = new Request(`https://sqc.test/api/groupquests/${quest.id}/refresh`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action: "refresh" }),
      });
      const context = { params: Promise.resolve({ id: quest.id }) };

      const response = await (variant === "web"
        ? webRoute.withWebRefreshRouteTestDependencies(dependencies as never, () => webRoute.POST(request, context))
        : mobileRoute.withMobileRefreshRouteTestDependencies(dependencies as never, () => mobileRoute.POST(request, context)));

      assert.equal(response.status, 200);
      assert.deepEqual(seenCutoffs, [joinedAt]);
    });
  }
}