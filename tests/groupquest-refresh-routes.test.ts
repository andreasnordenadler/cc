import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { createGroupQuestRefreshRouteHandler } from "../src/lib/groupquest-refresh-route-handler";

test("web and mobile production refresh routes invoke the tested handler", async () => {
  const routes = await Promise.all([
    readFile(new URL("../src/app/api/groupquests/[id]/refresh/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../src/app/api/mobile/groupquests/[id]/route.ts", import.meta.url), "utf8"),
  ]);
  for (const source of routes) {
    assert.match(source, /createGroupQuestRefreshRouteHandler\s*\(/);
    assert.match(source, /const lastCheck = checks\[checks\.length - 1\]\?\.result/);
    assert.match(source, /checks\.filter\(\(check\) => newlyPassedQuestIds\.includes\(check\.questId\)\)/);
  }
});

const quest = {
  id: "gq", questIds: ["old", "new"], startAt: "2026-07-01T00:00:00.000Z", endAt: "2026-07-20T00:00:00.000Z", rules: {},
  participants: [
    { userId: "victim", provider: "lichess" as const, username: "Victim", completedQuestIds: [], questFinishedAt: {} as Record<string, string>, score: 0 },
    { userId: "current", provider: "chesscom" as const, username: "Current", completedQuestIds: ["old"], questFinishedAt: { old: "2026-07-02T00:00:00.000Z" }, score: 100 },
  ],
};
const diagnostics = { status: "failed" as const, gameId: "game-new", summary: "did not match", mismatchReasons: ["time_control_mismatch" as const], gameUrl: "https://example/game", finalPositionFen: "8/8/8/8/8/8/8/8 w - - 0 1", lastMoveUci: "e7e8", lastMoveSan: "e8=Q" };

for (const mode of ["web", "mobile"] as const) {
  test(`${mode} refresh handler uses auth identity, ignores participant selection, retains legacy state, and skips duplicate writes`, async () => {
    const checked: string[] = [];
    const writes: unknown[] = [];
    const handler = createGroupQuestRefreshRouteHandler({
      mode,
      authenticate: async () => "current",
      findQuest: async () => quest,
      isFinished: () => false,
      reward: () => 50,
      check: async ({ questId, participant }) => {
        checked.push(participant.username);
        return questId === "old" ? { status: "passed", gameId: "old-game", summary: "already passed", gameTime: "2026-07-02T00:00:00.000Z" } : diagnostics;
      },
      persist: async (input) => { writes.push(input); },
    });
    const response = await handler(new Request("https://sqc.test/refresh", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "refresh", participantUserId: "victim" }) }), "gq");
    assert.equal(response.status, 200);
    assert.deepEqual(checked, ["Current", "Current"]);
    assert.equal(writes.length, 0);
    const body = await response.json();
    assert.deepEqual(body.completedQuestIds, ["old"]);
    assert.equal(body.score, 100);
    assert.deepEqual(body.checks[1], { questId: "new", status: "failed", summary: "did not match", gameId: "game-new", gameUrl: "https://example/game", mismatchCode: "time_control_mismatch", mismatchReasons: ["time_control_mismatch"], finalPositionFen: diagnostics.finalPositionFen, lastMoveUci: "e7e8", lastMoveSan: "e8=Q" });
    if (mode === "mobile") assert.deepEqual({ apiVersion: body.apiVersion, authenticated: body.authenticated, action: body.action, groupQuestId: body.groupQuestId }, { apiVersion: 1, authenticated: true, action: "refresh", groupQuestId: "gq" });
    else assert.equal(body.ok, true);
  });
}

test("refresh persistence receives every check while identifying only newly passed quest IDs", async () => {
  let saved: unknown;
  const handler = createGroupQuestRefreshRouteHandler({
    mode: "web", authenticate: async () => "current", findQuest: async () => quest, isFinished: () => false, reward: () => 50,
    check: async ({ questId }) => ({ status: "passed", gameId: `${questId}-game`, summary: "passed", gameTime: `2026-07-0${questId === "old" ? 2 : 3}T00:00:00.000Z` }),
    persist: async (input) => { saved = input; },
  });
  await handler(new Request("https://sqc.test/refresh", { method: "POST" }), "gq");
  assert.deepEqual(saved, {
    userId: "current", newlyPassedQuestIds: ["new"],
    progress: { completedQuestIds: ["old", "new"], questFinishedAt: { old: "2026-07-02T00:00:00.000Z", new: "2026-07-03T00:00:00.000Z" }, score: 150 },
    checks: [
      { questId: "old", result: { status: "passed", gameId: "old-game", summary: "passed", gameTime: "2026-07-02T00:00:00.000Z" } },
      { questId: "new", result: { status: "passed", gameId: "new-game", summary: "passed", gameTime: "2026-07-03T00:00:00.000Z" } },
    ],
  });
});

test("production adapter can persist a final failure summary but attempts completion only for an earlier new pass", async () => {
  let lastProofSummary: string | undefined;
  let attemptedQuestIds: string[] = [];
  const handler = createGroupQuestRefreshRouteHandler({
    mode: "web", authenticate: async () => "current", findQuest: async () => ({ ...quest, questIds: ["old", "new", "final"] }), isFinished: () => false, reward: () => 50,
    check: async ({ questId }) => questId === "final"
      ? { status: "failed", gameId: "final-game", summary: "final check failed", mismatchReasons: ["result_mismatch"] }
      : { status: "passed", gameId: `${questId}-game`, summary: "passed", gameTime: "2026-07-03T00:00:00.000Z" },
    persist: async ({ checks, newlyPassedQuestIds }) => {
      lastProofSummary = checks.at(-1)?.result.summary;
      attemptedQuestIds = checks.filter((check) => newlyPassedQuestIds.includes(check.questId)).map((check) => check.questId);
    },
  });
  await handler(new Request("https://sqc.test/refresh", { method: "POST" }), "gq");

  assert.equal(lastProofSummary, "final check failed");
  assert.deepEqual(attemptedQuestIds, ["new"]);
});
