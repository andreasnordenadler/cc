import assert from "node:assert/strict";
import test from "node:test";

import { buildGroupQuestRefreshChecks } from "../src/lib/groupquest-refresh-contract";
import { createGroupQuestRefreshRouteHandler } from "../src/lib/groupquest-refresh-route-handler";

const checks = [{
  questId: "finish-any-game",
  result: {
    status: "failed" as const,
    gameId: "game-99",
    summary: "Proof was not awarded. Play a matching public game, then refresh.",
    gameUrl: "https://www.chess.com/game/live/99",
    mismatchReasons: ["time_control_mismatch", "result_mismatch"] as const,
    finalPositionFen: "8/8/8/8/8/8/8/8 w - - 0 1",
    lastMoveUci: "e7e8",
    lastMoveSan: "e8=Q",
  },
}];

test("web and mobile refresh contracts share stable mismatch diagnostics", () => {
  const webChecks = buildGroupQuestRefreshChecks(checks);
  const mobileChecks = buildGroupQuestRefreshChecks(checks);

  assert.deepEqual(mobileChecks, webChecks);
  assert.deepEqual(webChecks[0], {
    questId: "finish-any-game",
    status: "failed",
    summary: "Proof was not awarded. Play a matching public game, then refresh.",
    gameId: "game-99",
    gameUrl: "https://www.chess.com/game/live/99",
    mismatchCode: "time_control_mismatch",
    mismatchReasons: ["time_control_mismatch", "result_mismatch"],
    finalPositionFen: "8/8/8/8/8/8/8/8 w - - 0 1",
    lastMoveUci: "e7e8",
    lastMoveSan: "e8=Q",
  });
});

test("web refresh returns only server-derived newly completed quest IDs", async () => {
  const handler = createGroupQuestRefreshRouteHandler({
    mode: "web",
    authenticate: async () => "viewer-1",
    findQuest: async () => ({
      id: "group-1",
      questIds: ["already-done", "newly-done"],
      participants: [{
        userId: "viewer-1",
        provider: "lichess",
        username: "alice",
        completedQuestIds: ["already-done"],
        score: 100,
      }],
    }),
    isFinished: () => false,
    reward: () => 100,
    check: async ({ questId }) => ({ status: "passed", gameId: `game-${questId}`, summary: "passed" }),
    persist: async () => undefined,
  });

  const response = await handler(new Request("https://sidequestchess.com/api/groupquests/group-1/refresh", { method: "POST" }), "group-1");
  const payload = await response.json();

  assert.equal(response.status, 200);
  assert.deepEqual(payload.newlyPassedQuestIds, ["newly-done"]);
});
